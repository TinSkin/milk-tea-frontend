import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Import Components
import Header from "./../components/Header";
import Footer from "./../components/Footer";
import FadeInOnScroll from "./../components/FadeInOnScroll";

// Import Imgae
import logo from "./../img/logo.png";
import beanLeaf from "./../img/bean-leaf.jpg";
import coffeeBean from "./../img/coffee-bean.jpg";

const Intro = () => {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ duration: 2 }}
          className="flex justify-center items-center"
        >
          <img src={logo} alt="w-full h-20 text-center" />
        </motion.div>

        {/* Journey Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto mb-[8rem]"
        >
          {/* Leaf Icon */}
          <div className="relative text-center">
            <img
              src={beanLeaf}
              alt="Bean Leaf Image"
              className="absolute left-[-2rem] top-[-5rem] h-24 rotate-[-10deg] z-[-5]"
            />
            <h2 className="text-[3rem] font-bold text-camel">
              Hành trình chinh phục hương vị mới
            </h2>
            <img
              src={coffeeBean}
              alt="Bean Leaf Image"
              className="absolute right-[-2rem] top-4 h-24 z-[-5]"
            />
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 2 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto mb-[8rem]"
        >
          <div className="border-box">
            <div className="md:flex ">
              <div className="flex justify-center items-center md:w-1/2">
                <img
                  className="block rounded-l-md"
                  src="https://content-prod-live.cert.starbucks.com/binary/v2/asset/137-98091.jpg"
                  alt=""
                />
              </div>
              <div className="p-5 flex items-center justify-center text-left bg-camel md:w-1/2 tracking-wider rounded-r-md">
                <div className="max-w-[83%]">
                  <h1 className="mb-4 text-3xl font-semibold text-dark_blue">
                    See You On the Patio
                  </h1>
                  <div className="mb-8 text-white ">
                    Soak up the season with Summer-Berry Refreshers and new Iced
                    Horchata Oatmilk Shaken Espresso. Fresh picks and returning
                    favorites are iced and ready.
                  </div>
                  <Link
                    className="rounded px-4 py-3 text-white bg-dark_blue cursor-pointer hover:border-logo_color hover:text-logo_color border-2 font-semibold"
                    to="/menu"
                  >
                    View Menu
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mb-[8rem]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-5">
            <div className="text-center">
              <p className="text-5xl font-bold text-camel">9</p>
              <p className="text-[#003d4d] mt-1 font-semibold">
                Năm trên một hành trình
              </p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-camel">15+</p>
              <p className="text-[#003d4d] mt-1 font-semibold">Tỉnh thành</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-camel">96+</p>
              <p className="text-[#003d4d] mt-1 font-semibold">
                Cửa hàng trên toàn quốc
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="w-full text-md text-camel leading-relaxed text-center tracking-wider">
            Từ niềm đam mê khám phá hương vị ở những vùng đất mới, những nghệ
            nhân <span className="text-logo_color font-bold">Penny</span> không
            ngừng theo đuổi sứ mệnh mang đến phong vị mới cho khách hàng. Sự kết
            hợp của nguồn nguyên liệu tinh hoa dưới bàn tay của nghệ nhân{" "}
            <span className="text-logo_color font-bold">Penny</span> sẽ mang đến
            cho khách hàng những trải nghiệm cảm nhận hương vị tinh tế và khó
            quên.
          </p>
        </div>

        {/* Image Section */}
        <FadeInOnScroll direction="right" delay={0.2}>
          <div className="max-w-4xl mx-auto mb-[8rem]">
            <div className="border-box">
              <div className="md:flex ">
                <div className="p-5 flex items-center justify-center text-left bg-camel md:w-1/2 tracking-wider rounded-l-md">
                  <div className="max-w-[83%]">
                    <h1 className="mb-4 text-3xl font-semibold text-dark_blue">
                      Order ahead. Pick up and fly.
                    </h1>
                    <div className="mb-8 text-white ">
                      Make summer travel more chill with the Starbucks® app.
                      Just find a store at an airport, order your favorites,
                      pick up and go.
                    </div>
                    <Link
                      className="rounded px-4 py-3 text-white bg-dark_blue cursor-pointer hover:border-logo_color hover:text-logo_color border-2 font-semibold"
                      to="/menu"
                    >
                      View Menu
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center items-center md:w-1/2">
                  <img
                    className="block h-[120%] rounded-md"
                    src="https://img.freepik.com/premium-photo/milk-tea-photography_776695-341.jpg"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Cà Phê Section */}
        <div className="max-w-4xl mx-auto mb-[8rem]">
          {/* Coffee Section */}
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Text */}
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold text-[#bb906a]">Cà Phê</h2>
              <p className="text-dark_blue font-semibold">
                Dưới bàn tay của nghệ nhân tại{" "}
                <span className="text-logo_color font-bold">Penny</span>, từng
                cốc cà phê trở thành một cuộc phiêu lưu hương vị đầy mê hoặc.
              </p>
              <ul className="list-disc pl-4 tracking-wider mb-[8rem]">
                <li className="text-dark_blue">
                  <strong className="text-camel">CÀ PHÊ ESPRESSO</strong> – Một
                  ngụm cà phê rang xay chất nhẹ với hậu vị ngọt êm, cân bằng,
                  rất dễ tiếp cận với những ai lần đầu thử uống này.
                </li>
                <li className="text-dark_blue">
                  <strong className="text-camel">CÀ PHÊ PHIN MÊ</strong> – Bộ
                  sưu tập Cà Phê Phin với công thức độc quyền từ{" "}
                  <span className="text-logo_color font-bold">Penny</span>, làm
                  nổi bật vị đậm đà đặc trưng của Robusta Buôn Mê Thuột.
                </li>
              </ul>
              <div>
                <Link
                  to="/menu"
                  className="border-2 border-[#bb906a] rounded px-7 py-3 text-sm hover:bg-[#bb906a] hover:text-white transition font-semibold tracking-wider"
                >
                  MENU
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="md:w-1/2 relative">
              <FadeInOnScroll direction="right" delay={1}>
                <img
                  src="https://katinat.vn/wp-content/uploads/2024/04/z5340844318458_d7b033c33f63b8b449759296691e9fcb.jpg"
                  alt="Cà Phê"
                  className="rounded-[30px]"
                />
              </FadeInOnScroll>
            </div>
          </div>

          {/* Tea Section */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 mt-10">
            {/* Text */}
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold text-[#bb906a]">Trà</h2>
              <p className="text-dark_blue font-semibold">
                Từ những búp trà non được hái trực tiếp từ vùng trà cao hơn
                1000m, những nghệ nhân{" "}
                <span className="text-logo_color font-bold">Penny</span> bắt đầu
                hành trình chinh phục vị giác.
              </p>
              <ul className="list-disc pl-4 tracking-wider">
                <li className="text-dark_blue">
                  <strong className="text-camel">TRÀ SỮA</strong> – Dòng sản
                  phẩm chắt lọc nét riêng trong từng giọt trà thơm nồng.
                </li>
                <li className="text-dark_blue">
                  <strong className="text-camel">TRÀ TRÁI CÂY</strong> – Sống
                  khoẻ với hương thơm của trà và sự tươi mát của trái cây.
                </li>
              </ul>
              <div>
                <Link
                  to="/menu"
                  className="border-2 border-[#bb906a] rounded px-7 py-3 text-sm hover:bg-[#bb906a] hover:text-white transition font-semibold tracking-wider"
                >
                  MENU
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="md:w-1/2">
              <FadeInOnScroll direction="left" delay={1}>
                <img
                  src="https://katinat.vn/wp-content/uploads/2024/04/z5340931351976_648f57132c98d668ea5b3c2b71529bd3.jpg"
                  alt="Trà"
                  className="rounded-[30px]"
                />
              </FadeInOnScroll>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <FadeInOnScroll direction="left">
          <div className="max-w-4xl mx-auto mb-[8rem]">
            <div className="border-box">
              <div className="md:flex ">
                <div className="flex justify-center items-center md:w-1/2">
                  <img
                    className="block h-[110%] rounded-md"
                    src="https://img.freepik.com/premium-vector/bubble-milk-tea-advertisement_317810-3551.jpg?"
                    alt=""
                  />
                </div>
                <div className="p-8 flex items-center justify-center text-left bg-camel md:w-1/2 tracking-wider rounded-r-md">
                  <div className="max-w-[83%]">
                    <h1 className="mb-4 text-3xl font-semibold text-dark_blue">
                      Your first taste of Rewards is free
                    </h1>
                    <div className="mb-8 text-white ">
                      Unlock Rewards with your first order. Enjoy a free
                      handcrafted drink when you make a qualifying purchase
                      during your first week as a Starbucks® Rewards member.*
                      Join now
                    </div>
                    <Link
                      to="/menu"
                      className="rounded px-4 py-3 text-white bg-dark_blue cursor-pointer hover:border-logo_color hover:text-logo_color border-2 font-semibold"
                    >
                      View Menu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInOnScroll>

        {/* Continue */}
        <div className="max-w-4xl mx-auto mb-10 text-center">
          {/* Description */}
          <p className="w-full text-md text-dark_blue leading-relaxed text-center tracking-wider font-semibold mb-10">
            Từng búp trà, từng giọt sữa là nguồn cảm hứng bất tận cho những công
            thức đột phá, những sản phẩm tâm huyết giúp{" "}
            <span className="text-logo_color font-bold">Penny</span> chinh phục
            vị giác của khách hàng.{" "}
            <span className="text-logo_color font-bold">Penny</span> tự hào mang
            đến những sản phẩm với hương vị đặc sắc, và bạn chính là một phần
            đặc biệt của…
          </p>

          <h2 className="text-3xl font-bold text-camel">. . . Continued!</h2>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Intro;
