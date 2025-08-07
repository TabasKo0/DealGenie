import PacmanLoader from "react-spinners/PacmanLoader";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen ">
      <div className="mb-4">
       
      </div>
      <div className="flex space-x-2 mb-4 cards">
       <div className="cardd1"> <div className="w-16 h-24 card1"> <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 3c-1.535 0-3.078.5-4.25 1.7-2.343 2.4-2.279 6.1 0 8.5L12 23l9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-.75.8-.75-.8C10.078 3.5 8.536 3 7 3" fill="#e74c3c"/></svg>  </div></div>
       <div className="cardd2"> <div className="w-16 h-24  card1"><svg width="40" height="40"  xmlns="http://www.w3.org/2000/svg" fill="#e74c3c" viewBox="0 0 223.646 223.646" ><path d="M111.823 0 16.622 111.823l95.201 111.823 95.202-111.823z"/></svg></div></div>
       <div className="cardd3"> <div className="w-16 h-24  card1"><svg width="800" height="800" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M232 140a56 56 0 0 1-81.901 49.65l11.94 35.82A8 8 0 0 1 154.45 236h-52.9a8 8 0 0 1-7.59-10.53l11.941-35.82A56 56 0 0 1 24 140c0-53.573 97.686-116.708 101.844-119.37a4 4 0 0 1 4.312 0C134.314 23.293 232 86.428 232 140"/></svg></div></div>
       <div className="cardd4"> <div className="w-16 h-24  card1"><svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M477.443 295.143a104.45 104.45 0 0 1-202.26 36.67c-.08 68.73 4.33 114.46 69.55 149h-177.57c65.22-34.53 69.63-80.25 69.55-149a104.41 104.41 0 1 1-66.34-136.28 104.45 104.45 0 1 1 171.14 0 104.5 104.5 0 0 1 135.93 99.61"/></svg></div></div>

      </div>
      <div className="text-lg font-semibold text-white-700">Loading</div>
    </div>
  );
}
