import { cn } from "@/lib/utils"

function SetupSectionTitle({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <h2 className="text-body-16-medium text-foreground">{title}</h2>
      {description ? (
        <p className="text-caption-12-regular text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export { SetupSectionTitle }
