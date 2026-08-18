import logoImage from "../assets/ChatGPT_Image_Aug_19__2026__01_44_28_AM-removebg-preview.png";

const LogoMark = ({ className = "" }) => (
  <img
    src={logoImage}
    alt="FriendLoop logo"
    className={className}
  />
);

export default LogoMark; 
