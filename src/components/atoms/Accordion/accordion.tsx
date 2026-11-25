import { twMerge } from "tailwind-merge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { AccordionChildrenProps } from "./types";

export function AccordionChildren({
  items,
  triggerClassName,
  contentClassName,
  itemClassName,
  openItem,
  setOpenItem,
  isRoute = false
}: AccordionChildrenProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={openItem}
      onValueChange={setOpenItem}
    >
      {items?.map((item, key) => (
        <AccordionItem
          key={key}
          value={`item-${key} `}
          className={itemClassName}
        >
          <AccordionTrigger
            className={twMerge(
              "relative my-0 flex flex-col items-stretch gap-3 rounded-[8px] bg-greenAqua-200 p-4 pr-12 text-left text-greenDark-1000 data-[state=open]:rounded-b-none lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:pr-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-4 [&>svg]:h-6 [&>svg]:w-6 lg:[&>svg]:static lg:[&>svg]:h-8 lg:[&>svg]:w-8",
              triggerClassName,
              item.triggerClassName
            )}
          >
            <h2
              className={`${
                isRoute ? "lg:w-[90%]" : "lg:w-[300px]"
              } w-full break-words text-left text-lg font-bold sm:text-xl lg:text-[24px]`}
            >
              {item.title}
            </h2>
            {item.properties.map((property, key) => (
              <span
                className="flex flex-col items-start gap-0.5 tracking-wide lg:flex-row lg:items-center lg:gap-4"
                key={key}
              >
                <span className="text-sm font-semibold lg:text-base">
                  {property.prop}
                </span>
                <span className="break-words text-[14px]">
                  {property.answer}
                </span>
              </span>
            ))}
          </AccordionTrigger>
          <AccordionContent
            className={twMerge(
              `rounded-b-[8px] border`,
              contentClassName,
              item.contentClassName
            )}
          >
            {item.children}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
