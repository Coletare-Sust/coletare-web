"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { NavigationLink } from "@molecules/MainHeader/constants";

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
  links: NavigationLink[];
  headerColor: string;
};

export default function Sidebar({
  isOpen,
  toggleSidebar,
  links,
  headerColor,
}: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        sticky top-0 z-[40]
        flex h-screen flex-col
        bg-white-800 transition-all duration-300 ease-in-out

        ${isOpen ? "w-72 p-6" : "w-20 p-4"}

        text-gray-700
      `}
    >
      <div
        className="absolute -right-2 top-5 z-[110] cursor-pointer p-1 transition-all hover:opacity-70"
        onClick={toggleSidebar}
      >
        <div
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-90" : "-rotate-90"
          }`}
          style={{ color: headerColor }}
        >
          <ChevronDown size={24} />
        </div>
      </div>
      <div
        className={`mb-8 flex items-center justify-center transition-all ${
          isOpen ? "pb-6" : "pb-6"
        }`}
      >
        <Image
          src="/sicol-logo.svg"
          alt="logo"
          width={isOpen ? 100 : 35}
          height={30}
          className="object-contain transition-all duration-300"
        />
      </div>

      <nav className="flex flex-col gap-4">
        {links.map((link, index) => {
          const isActive = pathname === link.url;
          const iconSrc = link.icon(headerColor);

          return (
            <Link
              key={index}
              href={link.url}
              className={`flex items-center rounded-xl p-3 transition-all hover:bg-gray-50 ${
                isOpen ? "justify-start gap-3" : "justify-center"
              } ${
                isActive ? "font-semibold underline underline-offset-4" : ""
              }`}
              style={{ color: headerColor }}
            >
              <div className="relative flex min-w-[24px] justify-center">
                <Image src={iconSrc} alt="icon" width={22} height={22} />

                {link.alertNumber && link.alertNumber > 0 && (
                  <span
                    className={`
                      absolute flex items-center justify-center rounded-full bg-error text-[10px] font-bold text-[#fff]
                      ${
                        isOpen
                          ? "-right-2 -top-2 h-5 w-5"
                          : "right-[-4px] top-[-4px] h-4 w-4"
                      }
                    `}
                  >
                    {link.alertNumber}
                  </span>
                )}
              </div>

              <span
                className={`text-sm transition-all duration-200 ${
                  isOpen ? "ml-2 block flex-1 opacity-100" : "hidden opacity-0"
                }
                whitespace-nowrap leading-normal`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
