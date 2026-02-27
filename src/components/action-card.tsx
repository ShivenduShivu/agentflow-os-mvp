import { Card, CardContent } from "@/components/ui/card"

export default function ActionCard({
  name,
  description,
  cost,
}: {
  name: string
  description: string
  cost: number
}) {
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-4 space-y-2">
        <div className="font-semibold text-lg">
          {name}
        </div>

        <div className="text-sm text-slate-600">
          {description || "No description"}
        </div>

        <div className="text-xs text-slate-500">
          Estimated cost: ${cost}
        </div>
      </CardContent>
    </Card>
  )
}