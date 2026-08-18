import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function Announcements({
  announcementsList = [],
}: {
  announcementsList?: Array<{ date: string; month: string; title: string; description: string; bgColor: string }>;
}) {
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
        {announcementsList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No announcements at this time.</p>
        ) : (
          <div className="space-y-3">
            {announcementsList.map((item, index) => (
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
        )}
      </CardContent>
    </Card>
  );
}
