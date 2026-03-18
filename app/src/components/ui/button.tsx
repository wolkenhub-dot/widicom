import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    
    // Base styles
    let classes = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
    
    // Variant styles
    switch(variant) {
        case "outline": classes += "border border-input bg-background hover:bg-accent hover:text-accent-foreground "; break;
        case "ghost": classes += "hover:bg-accent hover:text-accent-foreground "; break;
        case "destructive": classes += "bg-destructive text-destructive-foreground hover:bg-destructive/90 "; break;
        case "secondary": classes += "bg-secondary text-secondary-foreground hover:bg-secondary/80 "; break;
        case "link": classes += "text-primary underline-offset-4 hover:underline "; break;
        default: classes += "bg-primary text-primary-foreground hover:bg-primary/90 "; break;
    }

    // Size styles
    switch(size) {
        case "sm": classes += "h-9 rounded-md px-3 "; break;
        case "lg": classes += "h-11 rounded-md px-8 "; break;
        case "icon": classes += "h-10 w-10 "; break;
        default: classes += "h-10 px-4 py-2 "; break;
    }

    return (
      <button
        className={`${classes} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
