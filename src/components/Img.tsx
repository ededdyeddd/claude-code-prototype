import images_8d054fea_aead_4dcc_9ffb_eae076646aca_svg from "../assets/8d054fea-aead-4dcc-9ffb-eae076646aca.svg";

export const Img = ({ id }) => {
  switch (String(id)) {
    case "0":
      return (
        <img
          alt="Eduard Titskiy"
          className="size-full object-cover"
          draggable="false"
          src={images_8d054fea_aead_4dcc_9ffb_eae076646aca_svg}
        />
      );
    default:
      return null;
  }
};
