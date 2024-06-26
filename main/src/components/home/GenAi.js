import React, { useState } from "react";
import { ReactTyped } from "react-typed";
import axios from "axios";
import { FaArrowCircleUp } from "react-icons/fa";
import { Bars } from "react-loader-spinner";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const GenAi = () => {
  const [answer, setAnswer] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [ref, inView] = useInView();

  const genHandler = async (e) => {
    e.preventDefault();

    if (!prompt || isLoading) return;
    try {
      setLoading(true);
      setAnswer("Generating...");
      const response = await axios.post("http://localhost:5000/api/v1/genAi", {
        prompt,
      });

      if (response) {
        const formattedAnswer = response.data.text
          .replace(/\*\*\*/g, "<hr>")
          .replace(/\*\*/g, "<strong>")
          .replace(/\*\*/g, "</strong>")
          .replace(/\*/g, "<em>")
          .replace(/\*/g, "</em>")
          .replace(/\n/g, "<br>");
        setAnswer(formattedAnswer);
      } else {
        setAnswer("Server Time Out");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setAnswer("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full relative flex justify-center items-center min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-700">
      <motion.div
        className="absolute w-full h-full opacity-20 justify-center items-center flex z-0 top-0 left-0"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          className="max-h-[80vh]"
          src="https://res.cloudinary.com/dd6sontgf/image/upload/v1712864209/Q_A-Quastion-and-Answer-Royalty-Free-Animated-Icon-GIF-1080px-after-effects-project_wire1y.gif"
          initial={{ y: -50, rotate: 20, opacity: 0 }}
          animate={
            inView
              ? { y: 0, rotate: 0, opacity: 0.4 }
              : { y: -50, rotate: 20, opacity: 0 }
          }
          transition={{ duration: 1 }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -200 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0 , y:-200}}
        transition={{ duration: 1.5 }}
        ref={ref}
        className="p-6 relative shadow-2xl shadow-stone-500 z-50 my-20 xs:p-2 flex flex-col justify-center items-center gap-7 min-w-[200px] w-[600px] md:w-[60%] max-w-[1400px] mx-6 xs:mx-4 bg-white bg-opacity-40 rounded-lg"
      >
        <ReactTyped
          className="text-3xl xs:text:xl text-center font-bold text-white font-poppins"
          strings={["Ask a Legal Question"]}
          typeSpeed={40}
        />

        <form aria-labelledby="input" className="w-full flex flex-col gap-5">
          <label className="relative" id="input">
            <textarea
              value={prompt}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                genHandler(e);
              }}
              onChange={(e) => {
                setPrompt(e.target.value);
                setAnswer("");
              }}
              placeholder="Ask your question here..."
              className="placeholder:text-slate-400 z-0 min-w-[0px] resize-none custom-scrollbar pr-10 text-white py-1 font-bold font-poppins text-xl bg-black bg-opacity-20 ring-2 rounded-full px-4 w-full ring-white ring-offset-purple-900 focus:outline-none ring-offset-2"
            />
            <motion.div
              className="absolute top-4 right-3 z-50 text-white text-3xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isLoading ? (
                <Bars
                  height={30}
                  width={30}
                  color="#4fa94d"
                  ariaLabel="Loading"
                  className="absolute top-1/2 -mt-5 right-4"
                />
              ) : (
                <FaArrowCircleUp
                  onClick={genHandler}
                  className="cursor-pointer z-50"
                />
              )}
            </motion.div>
          </label>
          <motion.div
            className="w-full rounded-lg px-2 py-1"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ReactTyped
              className="text-lg text-pretty text-justify xs:text-md font-bold text-white font-poppins"
              strings={[answer]}
              typeSpeed={5}
            />
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default GenAi;
