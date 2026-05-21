export const pregnancyData = Array.from({ length: 40 }, (_, i) => {
  const week = i + 1;
  let size, emoji, length, weight, dev, mom, tips;

  if (week <= 4) {
    size = 'Poppy Seed'; emoji = '🌱'; length = '0.1 cm'; weight = '< 1 g';
    dev = ['Implantation occurs', 'Amniotic sac forms', 'Placenta begins developing'];
    mom = ['Missed period', 'Mild cramping or spotting', 'Fatigue begins'];
    tips = ['Start prenatal vitamins', 'Rest as needed', 'Schedule first OB visit'];
  } else if (week <= 8) {
    size = 'Raspberry'; emoji = '🍇'; length = '1.6 cm'; weight = '1 g';
    dev = ['Heart starts beating', 'Arm and leg buds form', 'Facial features begin'];
    mom = ['Morning sickness peaks', 'Frequent urination', 'Breast tenderness'];
    tips = ['Eat small frequent meals', 'Stay hydrated', 'Avoid intense smells'];
  } else if (week <= 12) {
    size = 'Plum'; emoji = '🍑'; length = '5.4 cm'; weight = '14 g';
    dev = ['Reflexes developing', 'Fingers and toes formed', 'Kidneys produce urine'];
    mom = ['Nausea may ease', 'Uterus above pubic bone', 'Energy might return'];
    tips = ['Light walking recommended', 'Stay hydrated', 'Consider prenatal yoga'];
  } else if (week <= 16) {
    size = 'Avocado'; emoji = '🥑'; length = '11.6 cm'; weight = '100 g';
    dev = ['Can grasp umbilical cord', 'Bones are hardening', 'Can make facial expressions'];
    mom = ['Baby bump shows', 'Skin changes', 'Increased appetite'];
    tips = ['Sleep on your side', 'Moisturize belly', 'Wear comfortable clothes'];
  } else if (week <= 20) {
    size = 'Banana'; emoji = '🍌'; length = '25.6 cm'; weight = '300 g';
    dev = ['Vernix coats the skin', 'Can hear sounds', 'Lanugo hair covers body'];
    mom = ['First kicks (quickening)', 'Round ligament pain', 'Hair and nails grow fast'];
    tips = ['Talk/sing to baby', 'Do pelvic floor exercises', 'Plan anatomy scan'];
  } else if (week <= 24) {
    size = 'Cantaloupe'; emoji = '🍈'; length = '30 cm'; weight = '600 g';
    dev = ['Taste buds forming', 'Brain grows rapidly', 'Lungs are developing branches'];
    mom = ['Braxton Hicks may start', 'Swelling in feet', 'Linea nigra appears'];
    tips = ['Elevate feet', 'Glucose screening test', 'Research birth classes'];
  } else if (week <= 28) {
    size = 'Eggplant'; emoji = '🍆'; length = '37.6 cm'; weight = '1000 g';
    dev = ['Eyes can open', 'Practicing breathing', 'Body fat increasing'];
    mom = ['Trouble sleeping', 'Shortness of breath', 'Leg cramps'];
    tips = ['Use a pregnancy pillow', 'Monitor kick counts', 'Discuss birth plan'];
  } else if (week <= 32) {
    size = 'Squash'; emoji = '🎃'; length = '42.4 cm'; weight = '1700 g';
    dev = ['Five senses are active', 'Head usually points down', 'Skin becomes opaque'];
    mom = ['Frequent urination returns', 'Heartburn', 'Leaking colostrum'];
    tips = ['Eat smaller meals', 'Pack hospital bag', 'Install car seat'];
  } else if (week <= 36) {
    size = 'Papaya'; emoji = '🥭'; length = '47.4 cm'; weight = '2600 g';
    dev = ['Rapid weight gain', 'Lungs nearly mature', 'Shedding lanugo'];
    mom = ['Pelvic pressure', 'Nesting instinct', 'Easier breathing (lightening)'];
    tips = ['Finalize birth plan', 'Rest often', 'Watch for labor signs'];
  } else {
    size = 'Watermelon'; emoji = '🍉'; length = '51 cm'; weight = '3400 g';
    dev = ['Fully developed organs', 'Waiting to be born', 'Building fat reserves'];
    mom = ['Loss of mucus plug', 'Stronger contractions', 'Emotional readiness'];
    tips = ['Rest and wait', 'Keep track of contractions', 'Stay calm'];
  }

  return { week, size, emoji, length, weight, development: dev, motherChanges: mom, tips };
});
