// components/dashboards/StatCard.tsx 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { LucideIcon } from "lucide-react"; 

interface StatCardProps { 
  title: string; 
  value: number | string; 
  icon: LucideIcon; 
  iconColor?: string;
  valueColor?: string;
  description?: string;
} 

export default function StatCard({ title, value, icon: Icon, iconColor = "text-muted-foreground", valueColor = "", description }: StatCardProps) { 
  return ( 
    <Card className="hover:shadow-lg transition-shadow duration-300"> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> 
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle> 
        <Icon className={`h-5 w-5 ${iconColor}`} /> 
      </CardHeader> 
      <CardContent> 
        <div className={`text-3xl font-bold ${valueColor}`}>{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent> 
    </Card> 
  ); 
}