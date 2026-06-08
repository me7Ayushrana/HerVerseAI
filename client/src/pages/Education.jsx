import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, HelpCircle, X, ChevronRight, Award, Check, AlertTriangle } from 'lucide-react';

const quizQuestions = [
  {
    id: 1,
    category: "Cycle Biology",
    question: "Synchronized cycles among housemates is a clinically proven biological phenomenon.",
    correctAnswer: "Myth",
    explanation: "Large-scale clinical studies show no proof that cycles synchronize. Overlapping periods are statistically expected simply because cycles vary in length."
  },
  {
    id: 2,
    category: "PCOS & Metabolic",
    question: "Regular resistance training (weightlifting) stabilizes PCOS symptoms by improving insulin sensitivity.",
    correctAnswer: "Fact",
    explanation: "Building muscle allows cells to absorb blood glucose more effectively, lowering circulating insulin and reducing androgen production."
  },
  {
    id: 3,
    category: "Cycle Biology",
    question: "Estrogen and Progesterone both drop to their lowest levels during menstruation.",
    correctAnswer: "Fact",
    explanation: "The drop in both hormones signals the uterus that no pregnancy occurred, triggering the shedding of the uterine lining."
  },
  {
    id: 4,
    category: "Cycle Biology",
    question: "You cannot get pregnant if you have intercourse during your period.",
    correctAnswer: "Myth",
    explanation: "Sperm can live in the female tract for up to 5 days. If you have a short cycle and ovulate early, fertilization can occur shortly after bleeding."
  },
  {
    id: 5,
    category: "Cycle Biology",
    question: "A normal adult menstrual cycle can range anywhere from 21 to 35 days.",
    correctAnswer: "Fact",
    explanation: "While 28 days is the textbook average, medical consensus defines a normal range as 21 to 35 days (and up to 45 days in teens)."
  },
  {
    id: 6,
    category: "Cycle Biology",
    question: "Exercising during your period should be avoided to prevent damage to the uterus.",
    correctAnswer: "Myth",
    explanation: "Moderate exercise is safe and beneficial during menstruation, releasing cramps-soothing endorphins and improving circulation."
  },
  {
    id: 7,
    category: "Cycle Biology",
    question: "Anovulatory cycles (cycles where no egg is released) can still cause period-like bleeding.",
    correctAnswer: "Fact",
    explanation: "This is called estrogen breakthrough bleeding, where the lining builds up and sheds unevenly without progesterone stabilization."
  },
  {
    id: 8,
    category: "Cycle Biology",
    question: "The average fertile window is about 6 days long.",
    correctAnswer: "Fact",
    explanation: "It spans the 5 days before ovulation and the day of ovulation itself, corresponding to the maximum lifespan of sperm and egg."
  },
  {
    id: 9,
    category: "Cycle Biology",
    question: "Menstrual blood is composed entirely of pure blood.",
    correctAnswer: "Myth",
    explanation: "It is a mixture of blood, tissue from the uterine lining (endometrium), mucus, and vaginal secretions."
  },
  {
    id: 10,
    category: "Cycle Biology",
    question: "Estrogen levels are at their highest during the first week of your period.",
    correctAnswer: "Myth",
    explanation: "Estrogen is at its lowest during your period and gradually rises during the follicular phase, peaking right before ovulation."
  },
  {
    id: 11,
    category: "Cycle Biology",
    question: "An adult female body typically releases only one mature egg per cycle.",
    correctAnswer: "Fact",
    explanation: "While multiple follicles start maturing, normally only one dominant follicle ruptures to release an egg during ovulation."
  },
  {
    id: 12,
    category: "Cycle Biology",
    question: "The luteal phase has a fixed length of 14 days for almost all women.",
    correctAnswer: "Myth",
    explanation: "While 14 days is standard, a healthy luteal phase can range from 11 to 17 days. Lengths under 10 days can indicate luteal phase defect."
  },
  {
    id: 13,
    category: "Cycle Biology",
    question: "Stress can delay or entirely stop your menstrual cycle.",
    correctAnswer: "Fact",
    explanation: "High cortisol suppresses GnRH (Gonadotropin-Releasing Hormone) in the hypothalamus, delaying LH surges and ovulation."
  },
  {
    id: 14,
    category: "Cycle Biology",
    question: "A healthy vaginal pH is slightly alkaline.",
    correctAnswer: "Myth",
    explanation: "Healthy vaginal pH is acidic, typically between 3.8 and 4.5, which helps prevent infections from bacteria and yeast."
  },
  {
    id: 15,
    category: "Cycle Biology",
    question: "The cervix changes position and texture throughout the menstrual cycle.",
    correctAnswer: "Fact",
    explanation: "The cervix is low, hard, and closed during non-fertile times, but rises, softens, and opens during fertile ovulation windows."
  },
  {
    id: 16,
    category: "Cycle Biology",
    question: "Having two periods in one month is always a sign of a serious illness.",
    correctAnswer: "Myth",
    explanation: "Occasional short cycles can occur due to stress or anovulatory bleeding, though persistent double bleeding should be checked."
  },
  {
    id: 17,
    category: "Cycle Biology",
    question: "Women are born with all the eggs they will ever have.",
    correctAnswer: "Fact",
    explanation: "Females are born with about 1-2 million follicles. No new eggs are created during their lifetime, and the supply declines over time."
  },
  {
    id: 18,
    category: "Cycle Biology",
    question: "Ovulation can cause mild, one-sided pelvic pain.",
    correctAnswer: "Fact",
    explanation: "This is known as Mittelschmerz, caused by the swelling or rupture of the dominant follicle on the ovary surface."
  },
  {
    id: 19,
    category: "Cycle Biology",
    question: "The endometrium is the muscular outer layer of the uterus.",
    correctAnswer: "Myth",
    explanation: "The endometrium is the inner mucosal lining that thickens and sheds. The myometrium is the muscular outer layer."
  },
  {
    id: 20,
    category: "Cycle Biology",
    question: "Your basal body temperature (BBT) drops slightly after ovulation.",
    correctAnswer: "Myth",
    explanation: "BBT rises by about 0.5 to 1 degree Fahrenheit after ovulation due to the thermogenic properties of progesterone."
  },
  {
    id: 21,
    category: "Cycle Biology",
    question: "Menopause is clinically diagnosed after 12 consecutive months without a period.",
    correctAnswer: "Fact",
    explanation: "It marks the end of menstrual cycles, resulting from the depletion of ovarian follicles and cessation of estrogen production."
  },
  {
    id: 22,
    category: "PCOS & Metabolic",
    question: "PCOS is caused solely by having small cysts on the ovaries.",
    correctAnswer: "Myth",
    explanation: "PCOS is an endocrine and metabolic disorder. The 'cysts' are actually underdeveloped follicles that failed to ovulate."
  },
  {
    id: 23,
    category: "PCOS & Metabolic",
    question: "Over 70% of women with PCOS have some level of insulin resistance.",
    correctAnswer: "Fact",
    explanation: "Insulin resistance is a primary driver of PCOS, causing the ovaries to produce excess testosterone and disrupt cycles."
  },
  {
    id: 24,
    category: "PCOS & Metabolic",
    question: "Carbohydrates must be completely avoided to manage PCOS symptoms.",
    correctAnswer: "Myth",
    explanation: "Complete elimination is not needed. Shifting to complex, high-fiber carbohydrates helps maintain insulin levels without starvation."
  },
  {
    id: 25,
    category: "PCOS & Metabolic",
    question: "Excessive facial hair and acne in PCOS are caused by high androgen levels.",
    correctAnswer: "Fact",
    explanation: "Elevated androgens (male hormones) stimulate sebaceous glands and hair follicles, causing hirsutism and breakouts."
  },
  {
    id: 26,
    category: "PCOS & Metabolic",
    question: "PCOS only affects women who are overweight.",
    correctAnswer: "Myth",
    explanation: "Lean PCOS accounts for about 20-30% of cases. These women still experience insulin resistance, high androgens, and cycle irregularities."
  },
  {
    id: 27,
    category: "PCOS & Metabolic",
    question: "PCOS is a leading cause of ovulatory infertility.",
    correctAnswer: "Fact",
    explanation: "Because mature eggs are often not released, conceiving can be challenging without cycles support or medical guidance."
  },
  {
    id: 28,
    category: "PCOS & Metabolic",
    question: "Untreated PCOS increases the risk of developing Type 2 Diabetes.",
    correctAnswer: "Fact",
    explanation: "Chronic insulin resistance can progress to Type 2 diabetes over time if not managed with lifestyle or medical therapies."
  },
  {
    id: 29,
    category: "PCOS & Metabolic",
    question: "A high-protein breakfast helps stabilize blood sugar and reduces sweet cravings in PCOS.",
    correctAnswer: "Fact",
    explanation: "Protein limits insulin spikes, sustains satiety, and supports hormone production throughout the day."
  },
  {
    id: 30,
    category: "PCOS & Metabolic",
    question: "Birth control pills cure PCOS.",
    correctAnswer: "Myth",
    explanation: "Birth control pills manage symptoms by suppressing ovulation and clearing acne, but do not resolve the underlying metabolic issues."
  },
  {
    id: 31,
    category: "PCOS & Metabolic",
    question: "Apple Cider Vinegar before meals can improve insulin sensitivity in metabolic disorders.",
    correctAnswer: "Fact",
    explanation: "Clinical studies show acetic acid slows down starch digestion, lowering post-meal glucose and insulin spikes."
  },
  {
    id: 32,
    category: "PCOS & Metabolic",
    question: "Women with PCOS cannot get pregnant naturally.",
    correctAnswer: "Myth",
    explanation: "Many women with PCOS conceive naturally through cycle tracking, insulin management, and lifestyle adjustments."
  },
  {
    id: 33,
    category: "PCOS & Metabolic",
    question: "Metformin is a medication commonly prescribed to treat insulin resistance in PCOS.",
    correctAnswer: "Fact",
    explanation: "Metformin increases insulin sensitivity, reduces liver glucose output, and can restore regular ovulation in PCOS."
  },
  {
    id: 34,
    category: "PCOS & Metabolic",
    question: "All ovarian cysts are painful and require surgical removal.",
    correctAnswer: "Myth",
    explanation: "Most ovarian follicles in PCOS are painless, tiny (under 10mm), and require no surgery. Large functional cysts are different."
  },
  {
    id: 35,
    category: "PCOS & Metabolic",
    question: "Sleep deprivation worsens insulin resistance and weight gain in PCOS.",
    correctAnswer: "Fact",
    explanation: "Poor sleep raises cortisol levels, which impairs insulin function and increases cravings for simple sugars."
  },
  {
    id: 36,
    category: "PCOS & Metabolic",
    question: "Cardio is the only exercise that helps with weight management in PCOS.",
    correctAnswer: "Myth",
    explanation: "Resistance training is equally if not more effective, as muscle tissue burns glucose directly, lowering baseline insulin levels."
  },
  {
    id: 37,
    category: "PCOS & Metabolic",
    question: "Inositol supplements (specifically Myo & D-Chiro) support ovarian function in PCOS.",
    correctAnswer: "Fact",
    explanation: "Inositol acts as an insulin sensitizer, helping restore egg quality, reduce androgens, and regularize cycles."
  },
  {
    id: 38,
    category: "PCOS & Metabolic",
    question: "High levels of cortisol can mimic or worsen PCOS symptoms.",
    correctAnswer: "Fact",
    explanation: "Elevated cortisol triggers glucose release and insulin production, compounding metabolic and cycle disruptions."
  },
  {
    id: 39,
    category: "PCOS & Metabolic",
    question: "PCOS is diagnosed using the Rotterdam Criteria.",
    correctAnswer: "Fact",
    explanation: "Requires at least 2 of: irregular periods/anovulation, elevated androgens (clinical or lab), and polycystic ovaries on ultrasound."
  },
  {
    id: 40,
    category: "PCOS & Metabolic",
    question: "Dairy causes PCOS and must be completely avoided.",
    correctAnswer: "Myth",
    explanation: "There is no clinical evidence that dairy causes PCOS. While some sensitive individuals feel better without it, it is not a universal rule."
  },
  {
    id: 41,
    category: "PCOS & Metabolic",
    question: "Spearmint tea has mild anti-androgenic properties that can reduce mild facial hair.",
    correctAnswer: "Fact",
    explanation: "Spearmint has been shown to reduce free testosterone levels in women with PCOS, helping control mild hirsutism."
  },
  {
    id: 42,
    category: "Pregnancy & Prenatal",
    question: "Pregnancy lasts exactly 9 months.",
    correctAnswer: "Myth",
    explanation: "Full-term pregnancy is defined as 40 weeks (280 days), which is closer to 9.5 or 10 months depending on calendar month lengths."
  },
  {
    id: 43,
    category: "Pregnancy & Prenatal",
    question: "Morning sickness can occur at any time of the day or night.",
    correctAnswer: "Fact",
    explanation: "Despite its name, pregnancy-related nausea is driven by rising hCG and estrogen levels and can occur throughout the day."
  },
  {
    id: 44,
    category: "Pregnancy & Prenatal",
    question: "Folic acid is critical before and during early pregnancy to prevent neural tube defects.",
    correctAnswer: "Fact",
    explanation: "Folic acid supports early development of the fetal brain and spinal cord, preventing defects like spina bifida."
  },
  {
    id: 45,
    category: "Pregnancy & Prenatal",
    question: "A pregnant woman must eat for two, doubling her normal calorie intake.",
    correctAnswer: "Myth",
    explanation: "No extra calories are needed in the first trimester. Only about 340-450 extra calories/day are needed in the second and third trimesters."
  },
  {
    id: 46,
    category: "Pregnancy & Prenatal",
    question: "Moderate exercise is highly beneficial for both mother and baby during healthy pregnancies.",
    correctAnswer: "Fact",
    explanation: "Exercise improves cardiovascular health, reduces gestational diabetes risk, and can ease labor and postpartum recovery."
  },
  {
    id: 47,
    category: "Pregnancy & Prenatal",
    question: "You should completely cut out caffeine during pregnancy.",
    correctAnswer: "Myth",
    explanation: "Moderate caffeine intake (under 200mg per day, or about one 12-oz cup of coffee) is considered safe by obstetric guidelines."
  },
  {
    id: 48,
    category: "Pregnancy & Prenatal",
    question: "The placenta acts as a filter, protecting the fetus from all harmful substances.",
    correctAnswer: "Myth",
    explanation: "While it filters some large particles, many drugs, viruses, alcohol, and medications pass directly through to the baby."
  },
  {
    id: 49,
    category: "Pregnancy & Prenatal",
    question: "Implantation bleeding can occur around the time of the expected period.",
    correctAnswer: "Fact",
    explanation: "Light spotting can happen when the fertilized egg attaches to the uterine wall, often mistaken for a light period."
  },
  {
    id: 50,
    category: "Pregnancy & Prenatal",
    question: "Heartburn during pregnancy is caused by the baby having a lot of hair.",
    correctAnswer: "Myth",
    explanation: "Heartburn is caused by progesterone relaxing the lower esophageal sphincter, allowing stomach acid to rise."
  },
  {
    id: 51,
    category: "Pregnancy & Prenatal",
    question: "The baby's heart starts beating around week 5-6 of gestation.",
    correctAnswer: "Fact",
    explanation: "A primitive heart tube forms and starts rhythmic contractions, detectable on early transvaginal ultrasounds."
  },
  {
    id: 52,
    category: "Pregnancy & Prenatal",
    question: "Hot tubs and saunas should be avoided during pregnancy.",
    correctAnswer: "Fact",
    explanation: "Raising core body temperature above 101 degrees Fahrenheit can increase the risk of fetal neural tube defects."
  },
  {
    id: 53,
    category: "Pregnancy & Prenatal",
    question: "A mother's blood and the baby's blood mix freely during pregnancy.",
    correctAnswer: "Myth",
    explanation: "The placenta keeps maternal and fetal blood separate. Oxygen and nutrients cross the placental membrane without direct mixing."
  },
  {
    id: 54,
    category: "Pregnancy & Prenatal",
    question: "Breastfeeding can suppress ovulation, but is not a 100% reliable birth control.",
    correctAnswer: "Fact",
    explanation: "While exclusive breastfeeding delays cycle return (lactational amenorrhea), ovulation can return unpredictably before the first period."
  },
  {
    id: 55,
    category: "Pregnancy & Prenatal",
    question: "Certain foods like raw fish, unpasteurized cheese, and deli meats carry a listeria risk during pregnancy.",
    correctAnswer: "Fact",
    explanation: "Listeria bacteria can cross the placenta, leading to miscarriage or severe infection, so high-risk foods should be avoided."
  },
  {
    id: 56,
    category: "Pregnancy & Prenatal",
    question: "You can determine the baby's gender by the shape of the mother's belly.",
    correctAnswer: "Myth",
    explanation: "Belly shape is determined by the mother's muscle tone, uterine shape, and fetal position, not the baby's gender."
  },
  {
    id: 57,
    category: "Pregnancy & Prenatal",
    question: "GDM (Gestational Diabetes Mellitus) is screened using a glucose tolerance test.",
    correctAnswer: "Fact",
    explanation: "A sugary drink is consumed followed by blood glucose checks to evaluate how insulin handles the load during pregnancy."
  },
  {
    id: 58,
    category: "Pregnancy & Prenatal",
    question: "Eating spicy foods can induce labor.",
    correctAnswer: "Myth",
    explanation: "There is no clinical link between spicy foods and labor induction, though they can cause digestive upset or heartburn."
  },
  {
    id: 59,
    category: "Pregnancy & Prenatal",
    question: "The amniotic fluid cushions the baby and helps develop their lungs.",
    correctAnswer: "Fact",
    explanation: "Fetal breathing movements of amniotic fluid are necessary for normal lung development and growth."
  },
  {
    id: 60,
    category: "Pregnancy & Prenatal",
    question: "Stretch marks can be completely prevented with expensive cocoa butter creams.",
    correctAnswer: "Myth",
    explanation: "Stretch marks are determined by genetics and skin elasticity. Creams can moisturize but cannot prevent dermal tearing."
  },
  {
    id: 61,
    category: "Pregnancy & Prenatal",
    question: "Preeclampsia is a pregnancy complication characterized by high blood pressure.",
    correctAnswer: "Fact",
    explanation: "Usually begins after 20 weeks and can damage organs like the kidneys if untreated, requiring monitoring."
  },
  {
    id: 62,
    category: "Hormonal Wellness",
    question: "PMS (Premenstrual Syndrome) symptoms are entirely psychological.",
    correctAnswer: "Myth",
    explanation: "PMS has biological roots driven by hormonal shifts impacting neurotransmitters like serotonin and GABA."
  },
  {
    id: 63,
    category: "Hormonal Wellness",
    question: "Progesterone is the dominant hormone produced during the luteal phase.",
    correctAnswer: "Fact",
    explanation: "Produced by the corpus luteum, progesterone stabilizes the uterine lining and calms the nervous system."
  },
  {
    id: 64,
    category: "Hormonal Wellness",
    question: "Endometriosis is just severe period pain and can be cured with simple painkillers.",
    correctAnswer: "Myth",
    explanation: "Endometriosis is a systemic inflammatory disease where tissue similar to the uterine lining grows outside the uterus, causing pain and adhesions."
  },
  {
    id: 65,
    category: "Hormonal Wellness",
    question: "Vitamin D acts as a pro-hormone and supports estrogen and progesterone synthesis.",
    correctAnswer: "Fact",
    explanation: "Vitamin D receptors are located in the ovaries and endometrium, playing a vital role in healthy steroidogenesis."
  },
  {
    id: 66,
    category: "Hormonal Wellness",
    question: "The thyroid gland has no impact on reproductive health or period regularity.",
    correctAnswer: "Myth",
    explanation: "Hypothyroidism or hyperthyroidism directly disrupts GnRH and prolactin, frequently causing irregular periods or fertility issues."
  },
  {
    id: 67,
    category: "Hormonal Wellness",
    question: "High levels of estrogen relative to progesterone can cause PMS, breast tenderness, and heavy periods.",
    correctAnswer: "Fact",
    explanation: "This state is called estrogen dominance, often resulting from low progesterone production or poor estrogen metabolism in the liver."
  },
  {
    id: 68,
    category: "Hormonal Wellness",
    question: "Cortisol is known as the master stress hormone.",
    correctAnswer: "Fact",
    explanation: "Released by the adrenal glands, cortisol helps the body handle acute stress but impairs thyroid and reproductive systems if chronically high."
  },
  {
    id: 69,
    category: "Hormonal Wellness",
    question: "Hormone imbalances can cause chronic fatigue, brain fog, and unexplained weight changes.",
    correctAnswer: "Fact",
    explanation: "Hormones like thyroid hormones, insulin, cortisol, and estrogen directly control metabolism, brain function, and cellular energy levels."
  },
  {
    id: 70,
    category: "Hormonal Wellness",
    question: "Xenoestrogens (found in plastics and chemical cosmetics) can mimic estrogen and disrupt endocrine function.",
    correctAnswer: "Fact",
    explanation: "These compounds bind to estrogen receptors, sending false signals and contributing to estrogen dominance."
  },
  {
    id: 71,
    category: "Hormonal Wellness",
    question: "Hormones are only active in the reproductive organs.",
    correctAnswer: "Myth",
    explanation: "Hormones are systemic chemical messengers traveling through the bloodstream to affect receptors in the brain, heart, bones, and skin."
  },
  {
    id: 72,
    category: "Hormonal Wellness",
    question: "Melatonin is a hormone that regulates the sleep-wake cycle.",
    correctAnswer: "Fact",
    explanation: "Produced by the pineal gland in response to darkness, melatonin supports deep sleep and acts as a cellular antioxidant."
  },
  {
    id: 73,
    category: "Hormonal Wellness",
    question: "DHEA is a precursor hormone that the body uses to make estrogen and testosterone.",
    correctAnswer: "Fact",
    explanation: "Produced by the adrenal glands, DHEA supports bone density, muscle mass, and energy levels."
  },
  {
    id: 74,
    category: "Hormonal Wellness",
    question: "Saliva tests are the only way to measure hormone levels.",
    correctAnswer: "Myth",
    explanation: "Hormones can be measured via blood serum, saliva, or dried urine tests, depending on whether free or metabolized hormones are analyzed."
  },
  {
    id: 75,
    category: "Hormonal Wellness",
    question: "The liver is responsible for breaking down and metabolizing hormones like estrogen.",
    correctAnswer: "Fact",
    explanation: "The liver processes estrogen into water-soluble metabolites for excretion. Poor liver clearance leads to hormone recycling."
  },
  {
    id: 76,
    category: "Hormonal Wellness",
    question: "Ghrelin is the hormone that signals fullness to the brain.",
    correctAnswer: "Myth",
    explanation: "Ghrelin is the hunger hormone stimulating appetite. Leptin is the satiety hormone signaling that you are full."
  },
  {
    id: 77,
    category: "Hormonal Wellness",
    question: "Phytoestrogens in foods like soy always cause estrogen dominance and hormonal blocks.",
    correctAnswer: "Myth",
    explanation: "Phytoestrogens bind weakly to estrogen receptors and can actually have a balancing effect, blocking stronger estrogens."
  },
  {
    id: 78,
    category: "Hormonal Wellness",
    question: "Prostaglandins are chemical messengers that cause the uterus to contract during menstruation.",
    correctAnswer: "Fact",
    explanation: "High levels of inflammatory prostaglandins are the direct cause of painful menstrual cramps (dysmenorrhea)."
  },
  {
    id: 79,
    category: "Hormonal Wellness",
    question: "Adrenal fatigue is a recognized medical diagnosis for chronic tiredness.",
    correctAnswer: "Myth",
    explanation: "While chronic stress impairs the HPA axis (adrenal output), 'adrenal fatigue' is not a recognized medical diagnosis. HPA Axis Dysfunction is the correct term."
  },
  {
    id: 80,
    category: "Hormonal Wellness",
    question: "Oxytocin is often referred to as the love or bonding hormone.",
    correctAnswer: "Fact",
    explanation: "Released during physical touch, childbirth, and breastfeeding, oxytocin promotes trust, bonding, and reduces anxiety."
  },
  {
    id: 81,
    category: "Hormonal Wellness",
    question: "FSH and LH are released by the ovaries.",
    correctAnswer: "Myth",
    explanation: "FSH and LH are gonadotropins released by the anterior pituitary gland in the brain to signal the ovaries."
  },
  {
    id: 82,
    category: "Fitness & Nutrition",
    question: "Fasting or extreme calorie restriction is beneficial for stabilizing female reproductive hormones.",
    correctAnswer: "Myth",
    explanation: "Low energy availability alerts the brain of scarce resources, shutting down LH pulses and causing cycle loss (amenorrhea)."
  },
  {
    id: 83,
    category: "Fitness & Nutrition",
    question: "Magnesium relaxes smooth muscle tissue, which can help alleviate menstrual cramps.",
    correctAnswer: "Fact",
    explanation: "Magnesium limits calcium entry into smooth muscle cells, decreasing uterine spasms and uterine cramping pain."
  },
  {
    id: 84,
    category: "Fitness & Nutrition",
    question: "Carbohydrates are the enemy of weight management and hormonal health.",
    correctAnswer: "Myth",
    explanation: "Carbohydrates are required for thyroid conversion (T4 to active T3) and GnRH function. Choosing fiber-rich whole carbs is key."
  },
  {
    id: 85,
    category: "Fitness & Nutrition",
    question: "Healthy fats like omega-3s are essential building blocks for steroid hormones.",
    correctAnswer: "Fact",
    explanation: "Cholesterol from healthy dietary fats is the direct precursor the body uses to synthesize progesterone, estrogen, and testosterone."
  },
  {
    id: 86,
    category: "Fitness & Nutrition",
    question: "Cruciferous vegetables (broccoli, kale) contain compounds that help the liver clear excess estrogen.",
    correctAnswer: "Fact",
    explanation: "They contain Indole-3-Carbinol (I3C) and DIM, which support liver detoxification of estrogen into safe metabolites."
  },
  {
    id: 87,
    category: "Fitness & Nutrition",
    question: "All fats are harmful and lead to heart disease.",
    correctAnswer: "Myth",
    explanation: "Monounsaturated and polyunsaturated fats (avocados, olive oil, nuts) reduce inflammation and protect cardiovascular health."
  },
  {
    id: 88,
    category: "Fitness & Nutrition",
    question: "Eating high-fiber foods supports gut health and aids hormone elimination.",
    correctAnswer: "Fact",
    explanation: "Fiber binds to metabolized hormones in the digestive tract, preventing them from being reabsorbed into the blood."
  },
  {
    id: 89,
    category: "Fitness & Nutrition",
    question: "Drinking 8 glasses of water a day is a strict scientific requirement for everyone.",
    correctAnswer: "Myth",
    explanation: "Hydration needs depend on body size, activity level, climate, and diet. Thirst and urine color are better indicators."
  },
  {
    id: 90,
    category: "Fitness & Nutrition",
    question: "Zinc is crucial for normal follicle development and supporting egg quality.",
    correctAnswer: "Fact",
    explanation: "Zinc is involved in cell division and growth, playing a vital role in healthy oocyte development and ovulation."
  },
  {
    id: 91,
    category: "Fitness & Nutrition",
    question: "Seed cycling (eating flax/pumpkin and sesame/sunflower seeds) is clinically proven to balance hormones.",
    correctAnswer: "Myth",
    explanation: "No clinical trials support seed cycling specifically, though the seeds provide healthy fats, lignans, and minerals."
  },
  {
    id: 92,
    category: "Fitness & Nutrition",
    question: "Intermittent fasting affects males and females identically.",
    correctAnswer: "Myth",
    explanation: "Females are highly sensitive to energy sensor changes. Kisspeptin neurones are easily disrupted by fasting, altering cycle biology."
  },
  {
    id: 93,
    category: "Fitness & Nutrition",
    question: "Vitamin C increases the absorption of non-heme (plant-based) iron.",
    correctAnswer: "Fact",
    explanation: "Eating vitamin C (citrus, peppers) alongside iron-rich plant foods (spinach, lentils) dramatically improves iron absorption."
  },
  {
    id: 94,
    category: "Fitness & Nutrition",
    question: "Drinking alcohol has no impact on estrogen levels.",
    correctAnswer: "Myth",
    explanation: "Alcohol compromises liver function, hindering the metabolism of estrogen and temporarily raising blood estrogen levels."
  },
  {
    id: 95,
    category: "Fitness & Nutrition",
    question: "Probiotics can support the estrobolome, the gut bacteria that process estrogen.",
    correctAnswer: "Fact",
    explanation: "A healthy gut microbiome prevents the release of beta-glucuronidase, an enzyme that reactivates estrogen."
  },
  {
    id: 96,
    category: "Fitness & Nutrition",
    question: "You should workout at peak intensity everyday of your cycle.",
    correctAnswer: "Myth",
    explanation: "Working out at high intensity during low-energy phases (late luteal/menstrual) can raise cortisol and exhaust the body. Syncing is better."
  },
  {
    id: 97,
    category: "Fitness & Nutrition",
    question: "Iron is lost during menstruation, and low iron levels can lead to fatigue.",
    correctAnswer: "Fact",
    explanation: "Heavy periods deplete iron stores (ferritin), reducing oxygen transport capacity and causing fatigue."
  },
  {
    id: 98,
    category: "Fitness & Nutrition",
    question: "Vitamin B6 supports progesterone production and can relieve premenstrual mood changes.",
    correctAnswer: "Fact",
    explanation: "B6 is a cofactor for synthesis of dopamine and serotonin, helping regulate mood and support corpus luteum health."
  },
  {
    id: 99,
    category: "Fitness & Nutrition",
    question: "Calcium supplementation can reduce PMS symptoms in some clinical studies.",
    correctAnswer: "Fact",
    explanation: "Calcium helps stabilize neuromuscular excitability, which can decrease premenstrual spasms, bloating, and mood swings."
  },
  {
    id: 100,
    category: "Fitness & Nutrition",
    question: "Eating raw carrots can help lower estrogen levels by binding to it in the digestive tract.",
    correctAnswer: "Fact",
    explanation: "Raw carrots contain unique indigestible fibers that prevent estrogen from being reabsorbed in the intestines, aiding excretion."
  },
  {
    id: 101,
    category: "Fitness & Nutrition",
    question: "Folate and folic acid are chemically identical and absorbed in the body the same way.",
    correctAnswer: "Myth",
    explanation: "Folate is the natural form in food; folic acid is synthetic. Many individuals have MTHFR mutations, making active folate (methylfolate) better absorbed."
  },
  {
    id: 102,
    category: "Fitness & Nutrition",
    question: "CoQ10 supplementation has been shown to support mitochondrial energy and improve egg quality in older females.",
    correctAnswer: "Fact",
    explanation: "Coenzyme Q10 boosts mitochondrial respiration in oocytes, helping prevent age-related chromosomal separation errors."
  }
];

export default function Education() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // 'Myth' or 'Fact'
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCategory, setQuizCategory] = useState('All');
  const [askedIds, setAskedIds] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const articles = [
    {
      id: '1',
      title: "Understanding Hormonal Rhythms",
      summary: "Estrogen, Progesterone, LH, and FSH run your monthly cycle. Learn how these messengers interact.",
      content: `Your menstrual cycle is governed by a delicate dance of four primary hormones:

1. **FSH (Follicle Stimulating Hormone)**: Released by the brain, FSH prompts the ovaries to grow fluid-filled sacs (follicles), each containing an egg.
2. **Estrogen**: As follicles grow, they release estrogen. This hormone triggers the thickening of your uterine lining and boosts your physical energy and mood.
3. **LH (Luteinizing Hormone)**: Rising estrogen levels trigger a sharp surge in LH. This surge forces the dominant follicle to rupture, releasing the mature egg. This is **Ovulation**.
4. **Progesterone**: After ovulation, the ruptured follicle transforms into the corpus luteum, producing progesterone. Progesterone maintains the uterine lining for potential pregnancy. If no egg is fertilized, levels plummet, signaling the uterine lining to shed, starting **Menstruation**.

**Cycle Syncing Tip**: Tailor your workouts and calorie intake to these phases. High estrogen phases (follicular/ovulation) favor high-intensity training. High progesterone phases (luteal) favor slow recovery movements.`,
      tag: "Hormonal Health",
      emoji: "🧬"
    },
    {
      id: '2',
      title: "PCOS & Insulin Resistance",
      summary: "Explore the deep clinical link between blood sugar insulin levels and ovarian cyst development.",
      content: `Polycystic Ovary Syndrome (PCOS) is primarily an endocrine/metabolic disorder. A central driver for over 70% of PCOS cases is **Insulin Resistance**.

When you eat carbohydrates, they convert into glucose. The pancreas releases insulin to unlock cells, allowing them to absorb glucose for energy. In insulin-resistant bodies, cells ignore these insulin signals. The pancreas responds by pumping out more insulin to clear the glucose.

**The PCOS Connection**: High levels of insulin direct the ovaries to produce excess male hormones (androgens) like testosterone. Excess androgens block follicles from releasing mature eggs, forming small, immature fluid-filled sacs (erroneously called 'cysts') and causing irregular periods, facial hair, and weight gain.

**Lifestyle Strategy**:
* **Prioritize Fiber & Protein**: Eat complex carbs (quinoa, legumes) paired with healthy fats to slow down glucose absorption.
* **Resistance Training**: Building lean muscle activates glucose receptors independent of insulin, lowering circulating insulin levels naturally.`,
      tag: "Metabolic Health",
      emoji: "🥗"
    },
    {
      id: '3',
      title: "Pelvic Floor Wellness",
      summary: "Strengthen and support pelvic floor muscles to enhance deep bladder control and uterine health.",
      content: `The pelvic floor is a bowl-shaped sling of muscles stretching from your pubic bone to your tailbone. It supports your bladder, uterus, and bowels.

**Why Pelvic Floor Health Matters**:
Weakened pelvic floor muscles can lead to urinary incontinence, pelvic organ prolapse, or back pain. Conversely, hypertonic (excessively tight) pelvic floor muscles can cause pelvic pain or painful intimacy.

**Exercises for Balance**:
* **Kegels (Strengthening)**: Squeeze and lift your pelvic floor muscles (as if trying to stop the flow of urine). Hold for 5 seconds, relax fully for 5 seconds. Repeat 10 times.
* **Deep Diaphragmatic Breathing (Relaxation)**: Lie down, place one hand on your belly. Inhale deeply, allowing your belly and pelvic floor to expand fully. Exhale slowly, allowing them to return to neutral. This prevents muscle tension and calms the nervous system.`,
      tag: "Physical Fitness",
      emoji: "🧘‍♀️"
    }
  ];

  const filteredQuestions = quizCategory === 'All' 
    ? quizQuestions 
    : quizQuestions.filter(q => q.category === quizCategory);

  // Initialize or reset question on category change
  React.useEffect(() => {
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const firstQ = filteredQuestions[randomIndex];
      setCurrentQuestion(firstQ);
      setAskedIds([firstQ.id]);
    }
    setIsAnswered(false);
    setSelectedAnswer(null);
    setQuizScore(0);
  }, [quizCategory]);

  const handleQuizAnswer = (answer) => {
    if (isAnswered || !currentQuestion) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === currentQuestion.correctAnswer) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuiz = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);

    const unasked = filteredQuestions.filter(q => !askedIds.includes(q.id));

    if (unasked.length === 0) {
      // Completed category, restart
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      const nextQ = filteredQuestions[randomIndex];
      setCurrentQuestion(nextQ);
      setAskedIds([nextQ.id]);
      setQuizScore(0);
    } else {
      // Prioritize finding a random related question in the same category
      const currentCat = currentQuestion?.category;
      const unaskedRelated = unasked.filter(q => q.category === currentCat);
      
      let nextQ;
      if (unaskedRelated.length > 0) {
        const randomIndex = Math.floor(Math.random() * unaskedRelated.length);
        nextQ = unaskedRelated[randomIndex];
      } else {
        const randomIndex = Math.floor(Math.random() * unasked.length);
        nextQ = unasked[randomIndex];
      }
      
      setCurrentQuestion(nextQ);
      setAskedIds([...askedIds, nextQ.id]);
    }
  };

  const isLastQuestion = askedIds.length === filteredQuestions.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Education Hub</h2>
        <p className="text-muted text-sm">Empower yourself with evidence-based articles and test your knowledge with health quizzes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Articles Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <BookOpen className="text-primary" size={22} /> Guided Articles & Tutorials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <div key={art.id} className="bg-white/90 border border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all-smooth flex flex-col justify-between h-56">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{art.tag}</span>
                      <span className="text-2xl">{art.emoji}</span>
                    </div>
                    <h4 className="font-bold text-textMain text-md mb-2">{art.title}</h4>
                    <p className="text-xs text-muted leading-relaxed font-semibold">{art.summary}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedArticle(art)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 mt-4 self-start"
                  >
                    Read Article <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Myth vs Fact Quiz (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border-primary/20 shadow-md h-full flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 border-b border-primary/10 pb-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <HelpCircle className="text-primary" size={22} /> Myth vs Fact Quiz
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted">Topic:</span>
                  <select
                    value={quizCategory}
                    onChange={e => setQuizCategory(e.target.value)}
                    className="bg-white border border-primary/15 rounded-xl px-2 py-1 text-xs text-textMain font-medium cursor-pointer"
                  >
                    <option value="All">📚 All Topics</option>
                    <option value="Cycle Biology">🧬 Cycle Biology</option>
                    <option value="PCOS & Metabolic">⚡ PCOS & Metabolic</option>
                    <option value="Pregnancy & Prenatal">🍼 Pregnancy & Prenatal</option>
                    <option value="Hormonal Wellness">🌿 Hormonal Wellness</option>
                    <option value="Fitness & Nutrition">🍎 Fitness & Nutrition</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Score: {quizScore} / {askedIds.length}
                </span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Question {askedIds.length} / {filteredQuestions.length}
                </span>
              </div>

              {currentQuestion && (
                <>
                  {/* Question box */}
                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl mb-6 shadow-inner min-h-[110px] flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                      {currentQuestion.category}
                    </span>
                    <p className="text-sm font-semibold text-textMain leading-relaxed">
                      "{currentQuestion.question}"
                    </p>
                  </div>

                  {/* Option buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    {['Myth', 'Fact'].map((ans) => {
                      const isSelected = selectedAnswer === ans;
                      const isCorrect = currentQuestion.correctAnswer === ans;
                      let btnStyle = "bg-white border-primary/15 hover:bg-primary/5 text-textMain";

                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = "bg-green-500 border-green-500 text-white shadow-md";
                        } else if (isSelected) {
                          btnStyle = "bg-red-500 border-red-500 text-white shadow-md";
                        } else {
                          btnStyle = "bg-white border-primary/5 text-muted opacity-50";
                        }
                      }

                      return (
                        <button 
                          key={ans}
                          disabled={isAnswered}
                          onClick={() => handleQuizAnswer(ans)}
                          className={`py-3.5 rounded-xl border text-sm font-bold transition-all-smooth ${btnStyle}`}
                        >
                          {ans}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quiz feedback details */}
                  <AnimatePresence>
                    {isAnswered && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl text-xs font-semibold leading-relaxed border bg-white shadow-sm flex items-start gap-2 border-primary/10 animate-fade-in"
                      >
                        {selectedAnswer === currentQuestion.correctAnswer ? (
                          <div className="p-1 bg-green-100 rounded-full text-green-600 flex-shrink-0"><Check size={12} /></div>
                        ) : (
                          <div className="p-1 bg-red-100 rounded-full text-red-600 flex-shrink-0"><AlertTriangle size={12} /></div>
                        )}
                        <div>
                          <p className="font-bold text-textMain mb-1">
                            {selectedAnswer === currentQuestion.correctAnswer ? 'Correct Answer!' : 'Incorrect.'}
                          </p>
                          <p className="text-muted">{currentQuestion.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {isAnswered && (
              <button 
                onClick={handleNextQuiz}
                className="w-full mt-6 py-3 rounded-xl bg-primary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-1.5"
              >
                {isLastQuestion ? 'Restart Category' : 'Next Question'} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Pop-up article viewer modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bgDark border border-primary/20 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-textMain"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 text-muted hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl p-2 bg-white rounded-2xl shadow-sm border border-primary/10">{selectedArticle.emoji}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedArticle.tag}</span>
                  <h3 className="text-2xl font-display font-bold text-gradient mt-1">{selectedArticle.title}</h3>
                </div>
              </div>

              <div className="text-sm text-textMain leading-relaxed space-y-4 whitespace-pre-wrap border-t border-primary/10 pt-6">
                {selectedArticle.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
