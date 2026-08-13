import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";


export function OnLeave({
  onLeaveStaff = [],
}: {
  onLeaveStaff?: Array<{ name: string; initials: string; image?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">On Leave Today ({onLeaveStaff.length})</CardTitle>
          <Link href="#" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {onLeaveStaff.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No students on leave today.</p>
        ) : (
          <div className="flex justify-between">
            {onLeaveStaff.map((staff) => (
              <div key={staff.name} className="flex flex-col items-center space-y-1">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={staff.image} alt={staff.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                    {staff.initials}
                  </AvatarFallback>
                </Avatar>
                <p className="text-[10px] text-center truncate w-12">{staff.name}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
