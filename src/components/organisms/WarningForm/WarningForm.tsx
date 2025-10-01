"use client";

import { useState, useEffect } from "react";
import Title from "@/components/atoms/Title/title";
import Button from "@/components/atoms/Button/button";
import Image from "next/image";
import { FaChevronLeft, FaTimes, FaArrowUp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { wrapper } from "@/common/constants/wrapper";

type WarningFormProps = {
  initialValues?: {
    title: string;
    description: string;
    image: File | string | null;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    image: File | string | null;
  }) => Promise<void>;
  loading?: boolean;
  buttonLabel: string;
  titlePage: string;
};

export default function WarningForm({
  initialValues,
  onSubmit,
  loading = false,
  buttonLabel,
  titlePage
}: WarningFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [image, setImage] = useState<File | string | null>(
    initialValues?.image || null
  );
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let previewUrl: string | null = null;

    if (image instanceof File) {
      previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);
    } else if (typeof image === "string") {
      setPreview(image);
    } else {
      setPreview(null);
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description, image });
  };

  return (
    <div style={wrapper} className="py-14">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl rounded-lg border border-greenBlue-400 bg-white-1000 p-10 shadow"
      >
        <div className="relative mb-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => router.push("/avisos")}
            className="absolute left-0 p-2 text-xl text-greenDark-1000 hover:text-green-800"
          >
            <FaChevronLeft />
          </button>
          <Title>{titlePage}</Title>
        </div>

        <div className="mb-10 flex flex-col gap-6 md:flex-row">
          <div className="flex w-full flex-col gap-4 md:w-1/2">
            <input
              type="text"
              placeholder="Inserir título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-greenBlue-400 p-3 text-gray-800 focus:outline-none"
            />

            <textarea
              placeholder="Inserir descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-md border border-greenBlue-400 p-3 text-gray-800 focus:outline-none"
            />
          </div>

          <div className="bg-white relative flex w-full items-center justify-center rounded-md border border-greenBlue-400 shadow md:w-1/2">
            {preview ? (
              <div className="bg-white relative h-40 w-full rounded-md p-2">
                <Image
                  src={preview}
                  alt="preview"
                  width={400}
                  height={400}
                  className="h-full w-full rounded-md object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="bg-white absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-sm hover:bg-gray-200"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="bg-white flex h-40 w-full cursor-pointer flex-col items-center justify-center p-3 text-gray-600"
              >
                <span className="text-xl">
                  <FaArrowUp />
                </span>
                <span className="mt-4 text-lg font-semibold">
                  anexar imagem
                </span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setImage(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="text-center">
          <Button buttonType="submit" disabled={loading}>
            {loading ? "Enviando..." : buttonLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
