import React from "react";
import CraftingMenu from "./components/CraftingMenu";
import { debugData } from "./utils/debugData";

// Setup debug data for browser development
debugData([
  {
    action: "setVisible",
    data: true,
  },
  {
    action: "setCraftingData",
    data: [
      {
        id: "1",
        name: "weapon_pistol",
        label: "Pistola",
        description:
          "Requer montagem precisa e peças industriais reforçadas para garantir o funcionamento do mecanismo de disparo.",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAkM_8fmNZqy1owM6hwP4F7i3ip2tTDrFZJG79Rn8vER0GfcI_kGxtXKvqG66QYjiJw1F3Ll4z4kb37fWb5Mu-XJBGGrBtXizEX5vlqpUqos-IUpSE9qNnK401TlGZHJ7DmbxXa-mJbsGgsMTgAaguR3Ts8ayLGyNIs2MGywL7QwiWeM9Jc4DXXxHUfHZE5IsUEquvPROCl5wqCuHoi1zU82fxy_iPV2HzujoVdNhO-EHDyFbhn_7vfEJr63N_EtpM5ofILVpAwbto",
        duration: 5000,
        ingredients: [
          { name: "iron", label: "Ferro", amount: 2, count: 0, image: "iron" },
          {
            name: "rubber",
            label: "Borracha",
            amount: 2,
            count: 0,
            image: "rubber",
          },
          {
            name: "plastic",
            label: "Plástico",
            amount: 3,
            count: 0,
            image: "plastic",
          },
        ],
      },
      {
        id: "2",
        name: "weapon_assaultrifle",
        label: "Rifle de Assalto",
        description: "Arma de longo alcance com alta cadência de tiro.",
        image: "https://freesvg.org/img/Assault-Rifle-Silhouette.png",
        duration: 15000,
        ingredients: [
          { name: "steel", label: "Aço", amount: 5, count: 10 },
          { name: "plastic", label: "Plástico", amount: 4, count: 5 },
        ],
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <div className="App">
      <CraftingMenu />
    </div>
  );
};

export default App;
