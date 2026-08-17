const seeds = ["Jack", "Leo", "Felix", "Jasper", "Oliver", "Aneka", "Jocelyn", "Sophia", "Mia", "Bella"];
seeds.forEach(s => {
  console.log(`https://api.dicebear.com/9.x/notionists/svg?seed=${s}`);
});
