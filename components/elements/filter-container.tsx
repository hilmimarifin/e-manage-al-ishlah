import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface FilterContainerProps {
  children: React.ReactNode;
  className?: string;
}

const FilterContainer = ({ children, className }: FilterContainerProps) => {
  return (
    <Card
      className={cn(
        "p-6 mb-6 shadow-md border-t-primary border-t-4",
        className
      )}
    >
      {children}
    </Card>
  );
};

export default FilterContainer;
