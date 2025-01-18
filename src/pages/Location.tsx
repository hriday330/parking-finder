import ButtonCard from "@/components/custom/ButtonCard"
import { Button } from "@/components/ui/button";

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
    <main>
      <section className="flex flex-row">
        <div className="flex flex-col">
        <img
        className="w-64"
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
        <div>
            <Button className="w-full my-2">
                Are you looking outside of Vancouver? 
            </Button>
        </div>
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
