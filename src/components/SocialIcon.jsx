import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGoogle,
  faFacebook,
  faGithub,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

function SocialIcon() {
  return (
    <div className="text-center">
      <a
        href="#"
        className="mx-2 text-[24px] text-camel hover:text-logo_color transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faGoogle} />
      </a>
      <a
        href="#"
        className="mx-2 text-[24px] text-camel hover:text-logo_color transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faFacebook} />
      </a>
      <a
        href="#"
        className="mx-2 text-[24px] text-camel hover:text-logo_color transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faGithub} />
      </a>
      <a
        href="#"
        className="mx-2 text-[24px] text-camel hover:text-logo_color transition-colors duration-300"
      >
        <FontAwesomeIcon icon={faLinkedin} />
      </a>
    </div>
  );
}

export default SocialIcon;
