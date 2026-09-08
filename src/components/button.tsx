import "./button.css"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import clsx from "clsx"

const buttonVariants = cva("tmap-button", {
  variants: {
    variant: {
      default: "tmap-button--default",
      outline: "tmap-button--outline",
      secondary: "tmap-button--secondary",
      ghost: "tmap-button--ghost",
      destructive: "tmap-button--destructive",
      link: "tmap-button--link",
    },
    size: {
      default: "tmap-button--size-default",
      xs: "tmap-button--size-xs",
      sm: "tmap-button--size-sm",
      lg: "tmap-button--size-lg",
      icon: "tmap-button--size-icon",
      "icon-xs": "tmap-button--size-icon-xs",
      "icon-sm": "tmap-button--size-icon-sm",
      "icon-lg": "tmap-button--size-icon-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={clsx(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
