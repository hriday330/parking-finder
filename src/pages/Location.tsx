import ButtonCard from "@/components/custom/ButtonCard"
import Link from "@/components/custom/Link";

const locations: LocationEntry[] = [
  { name: 'Downtown', link: '/', imageSrc: "/images/vancouver.jpg" },
  { name: 'SFU', link: '/' ,  imageSrc: "/images/sfu.jpg" },
  { name: 'UBC', link: '/' ,  imageSrc: "/images/ubc.jpg" },
  { name: 'Richmond', link: '/', imageSrc: "/images/richmond.webp" },
  { name: 'Burnaby', link: '/' ,  imageSrc: "/images/burnaby.jpg" },
  { name: 'Coquitlam', link: '/' ,  imageSrc: "/images/coquitlam.jpg" },
];

function Location() {
  return (
    <main className="w-screen justify-center">
      <section className="flex flex-row justify-evenly space-y-5">
        <div className="flex flex-col">
        <img
        className="w-64 mt-20"
        src="/images/mascot.webp"/>
        </div>
      <div className="flex flex-col">
      <h1 className="font-bold text-4xl mb-6">Where do you want to go?</h1>
        <div className="grid grid-cols-3 gap-6">
            {locations.map((location) => (
            <ButtonCard
                key={location.name}
                imageSrc={location.imageSrc}
                labelText={location.name}
                altText="image"
                onClick={() => {}}
            />
            ))}
        </div>

            <Link href="/plan-trip" variant="button" className="w-full text-white my-10">
            Are you looking elsewhere?
            </Link>
      </div>
    </section>
      
    </main>
  );
}

export default Location;

type LocationEntry = {
    name: string;
    imageSrc: string;
    link?: string;
}
