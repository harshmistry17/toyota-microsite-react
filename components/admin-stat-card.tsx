"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CityCount } from "@/lib/types"

interface AdminStatCardProps {
  title: string
  totalCount: number
  cityCounts: CityCount
}

export default function AdminStatCard({ title, totalCount, cityCounts }: AdminStatCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">{totalCount}</div>
        <div className="space-y-1 text-sm">
          {Object.entries(cityCounts).map(([city, count]) => (
            <div key={city} className="flex justify-between">
              <span className="text-gray-300">{city}:</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}