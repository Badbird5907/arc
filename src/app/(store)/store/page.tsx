import { appConfig, discord } from "@/app/app-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa";

export default function MainStorePage() {
  return (
    <Card className="w-1/3 m-4">
      <CardHeader>
        <CardTitle>Hello, World!</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <Button className="w-full">Hi</Button>
        </div>
      </CardContent>
    </Card>
  )
}