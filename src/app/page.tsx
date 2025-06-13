"use client";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/auth-client";

export default function Home() {
  const onSubmit = async () => {
    const { data, error } = await client.signUp.email({
      email: "test@example.com",
      password: "password1234",
      name: "test",
      image: "https://example.com/image.png",
    });
    console.log(data);
    console.log(error);
  };

  return <Button onClick={onSubmit}>Click me!</Button>;
}
