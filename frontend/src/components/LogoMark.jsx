import logoImage from "../assets/FriendLoop_Logo.png";

const LogoMark = ({ className = "" }) => (
  <img src={logoImage} alt="FriendLoop logo" className={className} />
);

export default LogoMark;
