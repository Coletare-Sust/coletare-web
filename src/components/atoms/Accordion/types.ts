import { ReactNode } from "react";

export interface AccordionChildrenProps {
  items: {
    title: string;
    properties: { prop: string; answer: string }[];
    children: ReactNode;
    contentClassName?: string;
    triggerClassName?: string;
  }[];
  contentClassName?: string;
  triggerClassName?: string;
  itemClassName?: string;
  openItem?: string;
  setOpenItem?: (value: string) => void;
  isRoute?: boolean;
}
