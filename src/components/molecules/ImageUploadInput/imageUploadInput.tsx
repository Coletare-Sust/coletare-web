"use client";
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Image from "next/image";
import Button from "@atoms/Button/button";
import Subtitle from "@/components/atoms/Subtitle/subtitle";
import getCroppedImg from "@/utils/getCroppedImg";

interface Props {
  onImageCropped: (blob: Blob) => void;
  defaultImage?: string | null;
}

const ImageUploadInput = ({ onImageCropped, defaultImage }: Props) => {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImage(reader.result as string);
        setShowModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (image && croppedAreaPixels) {
      try {
        const blob = await getCroppedImg(image, croppedAreaPixels);

        const previewUrl = URL.createObjectURL(blob);
        setPreview(previewUrl);

        onImageCropped(blob);

        setShowModal(false);
      } catch (error) {
        console.error("Erro ao salvar foto:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-dashed border-gray-300">
        <Image
          src={preview || defaultImage || "/collaborator.png"}
          fill
          className="object-cover"
          alt="Profile"
        />
        <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
          <span className="text-white text-xs font-bold">Alterar Foto</span>
          <input
            type="file"
            className="hidden"
            onChange={onFileChange}
            accept="image/*"
          />
        </label>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4">
          <div className="relative h-[600px] w-full max-w-xl rounded-lg bg-white-900 p-6 shadow-xl">
            <Subtitle className="mb-4 text-greenBlue-1000">
              Ajustar foto de perfil
            </Subtitle>

            <div className="relative h-80 w-full overflow-hidden rounded-md bg-gray-200">
              <Cropper
                image={image!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-greenBlue-1000"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                buttonType="button"
                onClick={() => setShowModal(false)}
                className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Button>

              <Button buttonType="button" onClick={handleSave}>
                Salvar Foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadInput;
