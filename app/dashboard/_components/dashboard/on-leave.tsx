import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const onLeaveStaff = [
    { name: "Angel", initials: "A", image: "/avatars/01.png" },
    { name: "Arun", initials: "A", image: "/avatars/02.png" },
    { name: "Tharun", initials: "T", image: "/avatars/03.png" },
    { name: "Lisa", initials: "L", image: "/avatars/04.png" },
    { name: "David", initials: "D", image: "/avatars/05.png" },
];

export function OnLeave() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">On Leave Today (5)</CardTitle>
                    <Link href="#" className="text-xs text-blue-600 hover:underline">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex justify-between">
                    {onLeaveStaff.map((staff) => (
                        <div key={staff.name} className="flex flex-col items-center space-y-1">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={staff.image} alt={staff.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                                    {staff.initials}
                                </AvatarFallback>
                            </Avatar>
                            <p className="text-[10px] text-center">{staff.name}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
