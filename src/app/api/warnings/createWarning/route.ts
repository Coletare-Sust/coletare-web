// Em app/api/warnings/createWarning/route.ts

import { createWarningService } from "@/store/services/warning";
import { NextResponse } from "next/server";

export interface WarningDTO {
  userId: string;
  title: string;
  description: string;
  image?: File;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const userId = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File | null;

    if (!userId || !title || !description) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes." },
        { status: 400 }
      );
    }

    const warning: WarningDTO = {
      userId,
      title,
      description,
      image: image || undefined
    };

    const response = await createWarningService(warning);

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar aviso:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
