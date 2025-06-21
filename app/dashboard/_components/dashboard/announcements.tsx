import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const announcements = [
    {
        date: "07",
        month: "Dec",
        title: "School Closed Due to Weather Alert",
        description: "Due to inclement weather, Classes will resume on 09-12-2024. Stay safe",
        bgColor: "bg-blue-50"
    },
    {
        date: "18",
        month: "Dec",
        title: "Annual Day Celebration",
        description: "Join us for our Annual Day celebration on 12-12-2024",
        bgColor: "bg-yellow-50"
    },
    {
        date: "22",
        month: "Dec",
        title: "Exam Schedule Released",
        description: "The Term 1 examination schedule will be available.",
        bgColor: "bg-gray-50"
    },
    {
        date: "24",
        month: "Dec",
        title: "Fee Deadline Approaching",
        description: "This is a reminder that the deadline for Term 2 fee payment is 24-12-2024",
        bgColor: "bg-gray-50"
    },
    {
        date: "31",
        month: "Dec",
        title: "Parent-Teacher Meetings",
        description: "Teachers will discuss student progress and address concerns. Attendance is mandatory.",
        bgColor: "bg-gray-50"
    },
];

export function Announcements() {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Announcements</CardTitle>
                    <Link href="#" className="text-sm text-blue-600 hover:underline">
                        View All
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {announcements.map((item, index) => (
                        <div key={index} className={`p-3 rounded-lg ${item.bgColor}`}>
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 text-center">
                                    <p className="text-lg font-bold text-gray-900">{item.date}</p>
                                    <p className="text-xs text-gray-600">{item.month}</p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
