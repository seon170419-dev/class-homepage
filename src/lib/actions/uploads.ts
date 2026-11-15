"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getSession, requireTeacher } from "@/lib/session";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
// Vercel 함수 요청 한도(4.5MB) 때문에 4MB로 제한 (next.config.ts bodySizeLimit과 맞춤)
const MAX_SIZE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const ALLOWED_FILE_TYPES = [
  ...ALLOWED_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/x-hwp",
  "application/haansofthwp",
  "application/zip",
];
const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/x-hwp": "hwp",
  "application/haansofthwp": "hwp",
  "application/zip": "zip",
};

// Vercel Blob이 연결되어 있으면(BLOB_READ_WRITE_TOKEN 자동 설정) 영구 저장소에,
// 아니면(로컬 개발) public/uploads 에 저장한다.
async function storeFile(file: File, ext: string): Promise<string> {
  const filename = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, { access: "public" });
    return blob.url;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadImageAction(file: File): Promise<{ url?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "로그인이 필요합니다." };

  if (!file || file.size === 0) return { error: "파일을 선택해 주세요." };
  if (file.size > MAX_SIZE_BYTES) return { error: "파일 크기는 4MB 이하여야 해요." };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "이미지 파일만 업로드할 수 있어요." };

  const url = await storeFile(file, file.type.split("/")[1] ?? "png");
  return { url };
}

// 이미지 외 문서(pdf/word/excel/hwp 등)도 허용하는 첨부파일 업로드.
export async function uploadFileAction(
  file: File
): Promise<{ url?: string; name?: string; error?: string }> {
  const session = await requireTeacher();
  if (!session) return { error: "권한이 없습니다." };

  if (!file || file.size === 0) return { error: "파일을 선택해 주세요." };
  if (file.size > MAX_SIZE_BYTES) return { error: "파일 크기는 4MB 이하여야 해요." };
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: "지원하지 않는 파일 형식이에요." };
  }

  const url = await storeFile(file, EXT_BY_TYPE[file.type] ?? file.type.split("/")[1] ?? "bin");
  return { url, name: file.name };
}
