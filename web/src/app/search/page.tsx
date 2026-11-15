import Search from "@/components/Search";

export const metadata = { title: "search | infracringe" };

export default function SearchPage() {
  return (
    <>
      <h1 className="mb-6 font-bold">$ grep -r</h1>
      <Search />
    </>
  );
}
