"use client";

import { useState, useEffect } from "react";
import Title from "@atoms/Title/title";
import Button from "@atoms/Button/button";
import { wrapper } from "@/common/constants/wrapper";
import Image from "next/image";
import { errorToast, successToast } from "@/hooks/useAppToast";
import { createWarningService } from "@/store/services/warning";
import useAuth from "@/hooks/useAuth";
import useProfile from "@/hooks/queries/useProfile";
import { useRouter } from "next/navigation";

const PostPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userUid } = useAuth();
  const { data: user } = useProfile(userUid);

  const router = useRouter();

  useEffect(() => {
    let previewUrl: string | null = null;
    if (image) {
      previewUrl = URL.createObjectURL(image);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      errorToast("Você deve inserir um título e uma descrição.");
      return;
    }
    if (!image) {
      errorToast("Selecione uma imagem.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Dados do post:", { title, description, image });

      if (!user) return;

      createWarningService({ cityId: user.id, title, description, image });
      successToast("Postagem realizada com sucesso!");

      setTitle("");
      setDescription("");
      setImage(null);

      router.push("/avisos");
    } catch (err) {
      alert("Erro ao postar.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  return (
    <div style={wrapper} className="py-14">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl rounded-lg border border-greenBlue-400 bg-white-1000 p-10 shadow"
      >
        <Title className="mb-10 text-center">Criar Novo Aviso</Title>

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

          <div className="relative flex w-full items-center justify-center rounded-md border border-greenBlue-400 bg-white-800 shadow md:w-1/2">
            {preview ? (
              <div className="relative h-40 w-full">
                <Image
                  src={preview}
                  alt="preview"
                  width={400}
                  height={400}
                  className="h-full w-full rounded-md object-contain"
                />

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-white absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-sm text-black shadow hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label
                htmlFor="image-upload"
                className="flex h-40 w-full cursor-pointer flex-col items-center justify-center text-gray-600"
              >
                <span className="text-4xl">↑</span>
                <span className="mt-2">anexar imagem</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="text-center">
          <Button buttonType="submit" disabled={loading}>
            {loading ? "Enviando..." : "Realizar post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostPage;
