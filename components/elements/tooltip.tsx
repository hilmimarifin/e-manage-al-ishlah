import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}
const Tooltip = ({ children, content, side = "top", sideOffset = 10 }: TooltipProps) => {
  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <TooltipComponent>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset}>
          <p>{content}</p>
        </TooltipContent>
      </TooltipComponent>
    </TooltipProvider>
  );
};
export default Tooltip;
