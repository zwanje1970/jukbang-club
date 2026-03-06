import Image from "next/image";

type Props = {
  imageUrl: string | null;
  title: string;
};

export default function MainBanner({ imageUrl, title }: Props) {
  if (!imageUrl) {
    return (
      <section className="bg-gray-100 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">{title}</h1>
        <p className="mt-2 text-gray-600">이미지는 관리자에서 등록할 수 있습니다.</p>
      </section>
    );
  }
  return (
    <section className="relative h-64 w-full md:h-80">
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <h1 className="text-2xl font-bold text-white drop-shadow md:text-4xl">{title}</h1>
      </div>
    </section>
  );
}
