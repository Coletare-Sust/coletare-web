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
              "my-0 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[8px] bg-greenAqua-200 p-4 text-greenDark-1000 data-[state=open]:rounded-b-none",
              triggerClassName,
              item.triggerClassName
            )}
          >
            <h2
              className={`${
                isRoute ? "w-[90%]" : "w-full sm:w-[300px]"
              } text-left text-xl font-bold sm:text-[24px]`}
            >
              {item.title}
            </h2>
            {item.properties.map((property, key) => (
              <span className="flex items-center gap-4 tracking-wide" key={key}>
                <span className="font-semibold">{property.prop}</span>
                <span className="text-[14px]">{property.answer}</span>
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
