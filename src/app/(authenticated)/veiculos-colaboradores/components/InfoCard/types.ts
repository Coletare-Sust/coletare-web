export interface InfoCardProps {
  title: string;
  id: string;
  values: {
    label: string;
    content: string;
  }[];
  type: "vehicle" | "collaborator";
}
