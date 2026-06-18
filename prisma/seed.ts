import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  // --- original users ---

  const ada = await prisma.user.create({
    data: {
      username: 'ada',
      displayName: 'Ada Lovelace',
      bio: 'Mathematician and writer.',
      createdAt: hoursAgo(40),
    },
  });

  const grace = await prisma.user.create({
    data: {
      username: 'grace',
      displayName: 'Grace Hopper',
      bio: 'Compiler pioneer.',
      createdAt: hoursAgo(39),
    },
  });

  const alan = await prisma.user.create({
    data: {
      username: 'alan',
      displayName: 'Alan Turing',
      bio: 'Mathematician and computer scientist.',
      createdAt: hoursAgo(38),
    },
  });

  const margaret = await prisma.user.create({
    data: {
      username: 'margaret',
      displayName: 'Margaret Hamilton',
      bio: 'Software engineering pioneer.',
      createdAt: hoursAgo(37),
    },
  });

  await prisma.follow.createMany({
    data: [
      { followerId: ada.id, followingId: grace.id },
      { followerId: ada.id, followingId: alan.id },
    ],
  });

  const gracePost = await prisma.post.create({
    data: {
      authorId: grace.id,
      body: 'Just shipped a new compiler optimization. Builds are 20% faster now!',
      createdAt: hoursAgo(1),
    },
  });

  await prisma.post.create({
    data: {
      authorId: alan.id,
      body: 'Thinking about machines that think. What does it mean for a machine to "understand"?',
      createdAt: hoursAgo(2),
    },
  });

  await prisma.post.create({
    data: {
      authorId: ada.id,
      body: 'Working on a new set of notes about the Analytical Engine. More soon.',
      createdAt: hoursAgo(3),
    },
  });

  await prisma.post.create({
    data: {
      authorId: margaret.id,
      body: 'Margins of error matter. Always plan for the unexpected case.',
      createdAt: hoursAgo(4),
    },
  });

  await prisma.post.create({
    data: {
      authorId: alan.id,
      parentId: gracePost.id,
      body: 'Congrats! Compiler performance work is so underrated.',
      createdAt: hoursAgo(0.5),
    },
  });

  // --- 20 new users ---

  const linus = await prisma.user.create({
    data: {
      username: 'linus',
      displayName: 'Linus Torvalds',
      bio: 'I just happen to be the person who wrote Linux.',
      createdAt: hoursAgo(220),
    },
  });

  const dennis = await prisma.user.create({
    data: {
      username: 'dennis',
      displayName: 'Dennis Ritchie',
      bio: 'C and Unix. The rest is history.',
      createdAt: hoursAgo(218),
    },
  });

  const ken = await prisma.user.create({
    data: {
      username: 'ken',
      displayName: 'Ken Thompson',
      bio: 'Unix. B. Go. Mostly Unix.',
      createdAt: hoursAgo(216),
    },
  });

  const barbara = await prisma.user.create({
    data: {
      username: 'barbara',
      displayName: 'Barbara Liskov',
      bio: 'If it looks like a duck and quacks like a duck, it should behave like a duck.',
      createdAt: hoursAgo(214),
    },
  });

  const tim = await prisma.user.create({
    data: {
      username: 'tim',
      displayName: 'Tim Berners-Lee',
      bio: 'This is for everyone.',
      createdAt: hoursAgo(212),
    },
  });

  const knuth = await prisma.user.create({
    data: {
      username: 'knuth',
      displayName: 'Donald Knuth',
      bio: 'Beware of bugs in the above code; I have only proved it correct, not tried it.',
      createdAt: hoursAgo(210),
    },
  });

  const dijkstra = await prisma.user.create({
    data: {
      username: 'dijkstra',
      displayName: 'Edsger Dijkstra',
      bio: 'The question of whether a computer can think is no more interesting than whether a submarine can swim.',
      createdAt: hoursAgo(208),
    },
  });

  const vint = await prisma.user.create({
    data: {
      username: 'vint',
      displayName: 'Vint Cerf',
      bio: 'Co-designer of TCP/IP. Chief Internet Evangelist.',
      createdAt: hoursAgo(206),
    },
  });

  const brian = await prisma.user.create({
    data: {
      username: 'brian',
      displayName: 'Brian Kernighan',
      bio: 'Everyone knows that debugging is twice as hard as writing a program.',
      createdAt: hoursAgo(204),
    },
  });

  const mccarthy = await prisma.user.create({
    data: {
      username: 'mccarthy',
      displayName: 'John McCarthy',
      bio: 'He who refuses to do arithmetic is doomed to talk nonsense.',
      createdAt: hoursAgo(202),
    },
  });

  const guido = await prisma.user.create({
    data: {
      username: 'guido',
      displayName: 'Guido van Rossum',
      bio: 'Python\'s BDFL (Benevolent Dictator For Life), retired.',
      createdAt: hoursAgo(200),
    },
  });

  const bjarne = await prisma.user.create({
    data: {
      username: 'bjarne',
      displayName: 'Bjarne Stroustrup',
      bio: 'C makes it easy to shoot yourself in the foot. C++ makes it harder, but when you do, it blows away your whole leg.',
      createdAt: hoursAgo(198),
    },
  });

  const carmack = await prisma.user.create({
    data: {
      username: 'carmack',
      displayName: 'John Carmack',
      bio: 'Focus is a matter of deciding what things you\'re not going to do.',
      createdAt: hoursAgo(196),
    },
  });

  const shannon = await prisma.user.create({
    data: {
      username: 'shannon',
      displayName: 'Claude Shannon',
      bio: 'Information is the resolution of uncertainty.',
      createdAt: hoursAgo(194),
    },
  });

  const stallman = await prisma.user.create({
    data: {
      username: 'stallman',
      displayName: 'Richard Stallman',
      bio: 'Free software is a matter of liberty, not price.',
      createdAt: hoursAgo(192),
    },
  });

  const gosling = await prisma.user.create({
    data: {
      username: 'gosling',
      displayName: 'James Gosling',
      bio: 'Father of Java. Sailor. Coffee enthusiast.',
      createdAt: hoursAgo(190),
    },
  });

  const hoare = await prisma.user.create({
    data: {
      username: 'hoare',
      displayName: 'Tony Hoare',
      bio: 'I call it my billion-dollar mistake.',
      createdAt: hoursAgo(188),
    },
  });

  const kay = await prisma.user.create({
    data: {
      username: 'kay',
      displayName: 'Alan Kay',
      bio: 'The best way to predict the future is to invent it.',
      createdAt: hoursAgo(186),
    },
  });

  const wirth = await prisma.user.create({
    data: {
      username: 'wirth',
      displayName: 'Niklaus Wirth',
      bio: 'Software gets slower faster than hardware gets faster.',
      createdAt: hoursAgo(184),
    },
  });

  const floyd = await prisma.user.create({
    data: {
      username: 'floyd',
      displayName: 'Robert Floyd',
      bio: 'Algorithms + Data Structures = Programs.',
      createdAt: hoursAgo(182),
    },
  });

  // --- posts for new users ---

  await prisma.post.createMany({
    data: [
      // linus — 8 posts
      { authorId: linus.id, body: 'Just merged a patch that reduces kernel boot time by 12%. Small wins compound.', createdAt: hoursAgo(215) },
      { authorId: linus.id, body: 'Good taste in code is not about cleverness. It\'s about choosing the solution that makes the problem disappear.', createdAt: hoursAgo(190) },
      { authorId: linus.id, body: 'Talk is cheap. Show me the code.', createdAt: hoursAgo(170) },
      { authorId: linus.id, body: 'Security people should understand that you can\'t ship something that\'s 100% secure. The goal is to make exploitation as hard and noisy as possible.', createdAt: hoursAgo(145) },
      { authorId: linus.id, body: 'Bad programmers worry about the code. Good programmers worry about data structures and their relationships.', createdAt: hoursAgo(120) },
      { authorId: linus.id, body: 'Linux is evolution, not intelligent design.', createdAt: hoursAgo(95) },
      { authorId: linus.id, body: 'The Linux philosophy is "laugh in the face of danger". Oops. Wrong one. "Do it yourself". That\'s it.', createdAt: hoursAgo(60) },
      { authorId: linus.id, body: 'Regression testing is what you do when you don\'t trust your own code anymore.', createdAt: hoursAgo(20) },

      // dennis — 6 posts
      { authorId: dennis.id, body: 'C is quirky, flawed, and an enormous success.', createdAt: hoursAgo(210) },
      { authorId: dennis.id, body: 'Unix is basically a simple operating system, but you have to be a genius to understand the simplicity.', createdAt: hoursAgo(185) },
      { authorId: dennis.id, body: 'The C language is a tool sharp enough to cut through any problem, and blunt enough to miss your foot completely.', createdAt: hoursAgo(155) },
      { authorId: dennis.id, body: 'The value of a prototype is in the education it gives you, not in the code itself.', createdAt: hoursAgo(110) },
      { authorId: dennis.id, body: 'We really did have fun at Bell Labs. It wasn\'t like work at all — it was play with purpose.', createdAt: hoursAgo(72) },
      { authorId: dennis.id, body: 'A language that doesn\'t change your thinking isn\'t worth knowing.', createdAt: hoursAgo(30) },

      // ken — 7 posts
      { authorId: ken.id, body: 'One of my most productive days was throwing away 1000 lines of code.', createdAt: hoursAgo(208) },
      { authorId: ken.id, body: 'When in doubt, use brute force.', createdAt: hoursAgo(188) },
      { authorId: ken.id, body: 'We knew that systems programming could be done in a high-level language. It just took Unix to prove it.', createdAt: hoursAgo(163) },
      { authorId: ken.id, body: 'Go is the result of 40 years of thinking about what we got wrong in C. We got quite a bit wrong.', createdAt: hoursAgo(130) },
      { authorId: ken.id, body: 'Regular expressions — they\'ve followed me my whole career. I\'m not sorry.', createdAt: hoursAgo(100) },
      { authorId: ken.id, body: 'The most important thing we learned from Unix: pipelines. Data flows, you just have to get out of the way.', createdAt: hoursAgo(55) },
      { authorId: ken.id, body: 'If in doubt, don\'t.', createdAt: hoursAgo(18) },

      // barbara — 5 posts
      { authorId: barbara.id, body: 'Abstraction is not about hiding complexity. It\'s about choosing which complexity to expose.', createdAt: hoursAgo(205) },
      { authorId: barbara.id, body: 'A subtype must be substitutable for its supertype. Not just structurally — behaviorally. This matters.', createdAt: hoursAgo(175) },
      { authorId: barbara.id, body: 'CLU gave us iterators in 1975. We\'re still rediscovering what we knew then.', createdAt: hoursAgo(140) },
      { authorId: barbara.id, body: 'The type system is your ally, not your enemy. Let it help you.', createdAt: hoursAgo(88) },
      { authorId: barbara.id, body: 'Data abstraction is the foundation. Everything we build is data abstraction, whether we call it that or not.', createdAt: hoursAgo(35) },

      // tim — 9 posts
      { authorId: tim.id, body: 'The web is more a social creation than a technical one. I designed it for a social effect — to help people work together.', createdAt: hoursAgo(207) },
      { authorId: tim.id, body: 'Any good engineer knows you can\'t design a system whose ultimate use case you cannot predict.', createdAt: hoursAgo(192) },
      { authorId: tim.id, body: 'HTTP was supposed to be stateless. Cookies were a workaround. Most of the web is now workarounds on workarounds.', createdAt: hoursAgo(168) },
      { authorId: tim.id, body: 'Decentralisation is the key architectural feature of the web. We must fight to preserve it.', createdAt: hoursAgo(148) },
      { authorId: tim.id, body: 'Data is a precious thing and will last longer than the systems themselves.', createdAt: hoursAgo(122) },
      { authorId: tim.id, body: 'The original proposal for the WWW was met with "vague but exciting". I\'ll take it.', createdAt: hoursAgo(92) },
      { authorId: tim.id, body: 'Semantic web thinking: the meaning of the data should travel with the data.', createdAt: hoursAgo(67) },
      { authorId: tim.id, body: 'An open web is not a given. It requires constant, deliberate effort to maintain.', createdAt: hoursAgo(38) },
      { authorId: tim.id, body: 'HTML was never meant to look good. It was meant to be machine-readable and human-writable. The rest was later.', createdAt: hoursAgo(12) },

      // knuth — 6 posts
      { authorId: knuth.id, body: 'Premature optimization is the root of all evil. But late optimization is missed opportunity.', createdAt: hoursAgo(203) },
      { authorId: knuth.id, body: 'An algorithm must be seen to be believed.', createdAt: hoursAgo(178) },
      { authorId: knuth.id, body: 'Programs are meant to be read by humans and only incidentally for computers to execute.', createdAt: hoursAgo(152) },
      { authorId: knuth.id, body: 'I have only proved it correct, not tested it. These are not the same thing. Both matter.', createdAt: hoursAgo(115) },
      { authorId: knuth.id, body: 'Science is what we understand well enough to explain to a computer. Art is everything else.', createdAt: hoursAgo(75) },
      { authorId: knuth.id, body: 'TeX has been in beta since 1978. I\'m still finding things to fix.', createdAt: hoursAgo(28) },

      // dijkstra — 8 posts
      { authorId: dijkstra.id, body: 'Go To Statement Considered Harmful. Still.', createdAt: hoursAgo(200) },
      { authorId: dijkstra.id, body: 'The purpose of abstraction is not to be vague, but to create a new semantic level in which one can be absolutely precise.', createdAt: hoursAgo(180) },
      { authorId: dijkstra.id, body: 'Simplicity is a prerequisite for reliability.', createdAt: hoursAgo(160) },
      { authorId: dijkstra.id, body: 'Testing shows the presence, not the absence, of bugs. Plan accordingly.', createdAt: hoursAgo(138) },
      { authorId: dijkstra.id, body: 'The competent programmer is fully aware of the strictly limited size of his own skull.', createdAt: hoursAgo(112) },
      { authorId: dijkstra.id, body: 'Computer science is no more about computers than astronomy is about telescopes.', createdAt: hoursAgo(82) },
      { authorId: dijkstra.id, body: 'I mean, if 10 years from now, when you are doing something quick and dirty, you suddenly visualize that I am looking over your shoulder and say "Dijkstra would not have liked this"... then that would be enough immortality for me.', createdAt: hoursAgo(48) },
      { authorId: dijkstra.id, body: 'A beautiful proof is one that illuminates. An ugly proof is one that merely verifies.', createdAt: hoursAgo(14) },

      // vint — 7 posts
      { authorId: vint.id, body: 'TCP/IP was designed assuming the network is unreliable. That assumption has served us well.', createdAt: hoursAgo(198) },
      { authorId: vint.id, body: 'The internet is not a thing. It\'s an agreement.', createdAt: hoursAgo(172) },
      { authorId: vint.id, body: 'Latency is the enemy. Bandwidth is just a number.', createdAt: hoursAgo(147) },
      { authorId: vint.id, body: 'IPv6 adoption is going well. Only took 25 years.', createdAt: hoursAgo(118) },
      { authorId: vint.id, body: 'End-to-end principle: push intelligence to the edges. The network should be dumb and fast.', createdAt: hoursAgo(85) },
      { authorId: vint.id, body: 'The internet was designed to survive a nuclear war. It was not designed to survive social media.', createdAt: hoursAgo(50) },
      { authorId: vint.id, body: 'Interoperability is not a feature. It\'s the entire point.', createdAt: hoursAgo(16) },

      // brian — 6 posts
      { authorId: brian.id, body: 'Debugging is twice as hard as writing the code in the first place. So if you write code as cleverly as possible, you are, by definition, not smart enough to debug it.', createdAt: hoursAgo(196) },
      { authorId: brian.id, body: 'AWK was supposed to be a quick hack. Forty years later, people are still AWKing.', createdAt: hoursAgo(168) },
      { authorId: brian.id, body: 'The Unix toolchain philosophy: do one thing, do it well, pipe to the next tool.', createdAt: hoursAgo(140) },
      { authorId: brian.id, body: 'The most effective debugging tool is still careful thought, coupled with judiciously placed print statements.', createdAt: hoursAgo(105) },
      { authorId: brian.id, body: 'Hello, World. Still the best first program.', createdAt: hoursAgo(68) },
      { authorId: brian.id, body: 'K&R was not supposed to be THE C book. It was supposed to be A C book. There\'s a difference.', createdAt: hoursAgo(25) },

      // mccarthy — 5 posts
      { authorId: mccarthy.id, body: 'LISP is worth learning for the profound enlightenment experience you will have when you finally get it.', createdAt: hoursAgo(193) },
      { authorId: mccarthy.id, body: 'Garbage collection solves more problems than it creates. The debate is closed.', createdAt: hoursAgo(162) },
      { authorId: mccarthy.id, body: 'Recursion is not a trick. It\'s a way of thinking.', createdAt: hoursAgo(128) },
      { authorId: mccarthy.id, body: 'The idea that programs can be data — and data can be programs — is the most powerful idea in computing.', createdAt: hoursAgo(78) },
      { authorId: mccarthy.id, body: 'AI summer, AI winter, AI summer again. The field oscillates but the problems remain.', createdAt: hoursAgo(22) },

      // guido — 7 posts
      { authorId: guido.id, body: 'Python\'s readability was not an accident. Every syntax decision was made with the reader in mind, not the writer.', createdAt: hoursAgo(192) },
      { authorId: guido.id, body: 'There should be one — and preferably only one — obvious way to do it.', createdAt: hoursAgo(170) },
      { authorId: guido.id, body: 'The GIL is a mistake I would not make again. But removing it is now its own kind of mistake.', createdAt: hoursAgo(144) },
      { authorId: guido.id, body: 'Explicit is better than implicit. This is not just a Python rule. It\'s a design rule.', createdAt: hoursAgo(116) },
      { authorId: guido.id, body: 'Type hints in Python were controversial. They are now the best decision we made in a decade.', createdAt: hoursAgo(84) },
      { authorId: guido.id, body: 'Beautiful is better than ugly. Simple is better than complex. Complex is better than complicated. These are ordered.', createdAt: hoursAgo(46) },
      { authorId: guido.id, body: 'Stepping down as BDFL was the right call. The project is bigger than any one person now.', createdAt: hoursAgo(10) },

      // bjarne — 6 posts
      { authorId: bjarne.id, body: 'There are only two kinds of programming languages: the ones people complain about and the ones nobody uses.', createdAt: hoursAgo(190) },
      { authorId: bjarne.id, body: 'C++ is not designed for just one paradigm. It\'s designed to support the right paradigm for the problem at hand.', createdAt: hoursAgo(165) },
      { authorId: bjarne.id, body: 'Zero-overhead abstractions were the goal from day one. We got closer with each standard revision.', createdAt: hoursAgo(138) },
      { authorId: bjarne.id, body: 'Modern C++ (11, 14, 17, 20) is genuinely a better language. The reputation is outdated.', createdAt: hoursAgo(104) },
      { authorId: bjarne.id, body: 'The standard library matters more than the language. Nobody programs in raw C++ anymore, they program in STL.', createdAt: hoursAgo(66) },
      { authorId: bjarne.id, body: 'Complexity is the enemy of security. Also of maintainability. Also of correctness. Focus on simplicity.', createdAt: hoursAgo(21) },

      // carmack — 9 posts
      { authorId: carmack.id, body: 'Focused, hard work is the real key to success. Keep your eyes on the goal and just keep taking the next step towards completing it.', createdAt: hoursAgo(188) },
      { authorId: carmack.id, body: 'The real trick to fast rendering is knowing what NOT to render.', createdAt: hoursAgo(175) },
      { authorId: carmack.id, body: 'DOOM was written in 9 months by 5 people. Modern AAA games take 5 years and 500 people. Something is wrong.', createdAt: hoursAgo(158) },
      { authorId: carmack.id, body: 'Functional programming has real advantages. The explicit data flow is worth the verbosity.', createdAt: hoursAgo(135) },
      { authorId: carmack.id, body: 'The GPU is the most interesting processor we have. It\'s a massively parallel machine that most code barely touches.', createdAt: hoursAgo(110) },
      { authorId: carmack.id, body: 'VR is hard. Human perception is relentless. 90fps is not enough, latency must be in the single digit milliseconds.', createdAt: hoursAgo(82) },
      { authorId: carmack.id, body: 'If you write the same code three times, abstract it. If you abstract it too early, you\'ve made a bigger mistake.', createdAt: hoursAgo(58) },
      { authorId: carmack.id, body: 'Work on hard things. The payoff for solving a hard problem is always higher than you expect.', createdAt: hoursAgo(32) },
      { authorId: carmack.id, body: 'Quake\'s BSP tree was overkill. I knew it at the time. I did it anyway because the problem was interesting.', createdAt: hoursAgo(8) },

      // shannon — 5 posts
      { authorId: shannon.id, body: 'The fundamental problem of communication is reproducing at one point a message selected at another.', createdAt: hoursAgo(186) },
      { authorId: shannon.id, body: 'Information is entropy. Compression is just finding the shorter description.', createdAt: hoursAgo(158) },
      { authorId: shannon.id, body: 'A bit is the most fundamental unit. Everything is bits. Even this post.', createdAt: hoursAgo(125) },
      { authorId: shannon.id, body: 'Channel capacity is a hard limit. You can approach it. You cannot exceed it.', createdAt: hoursAgo(82) },
      { authorId: shannon.id, body: 'I spent more time playing with toys and gadgets than doing math. The math came out of the play.', createdAt: hoursAgo(40) },

      // stallman — 7 posts
      { authorId: stallman.id, body: 'Free software is a matter of liberty, not price. To understand the concept, think of "free speech", not "free beer".', createdAt: hoursAgo(184) },
      { authorId: stallman.id, body: 'GNU is not Unix. That\'s the joke. The project is also the punchline.', createdAt: hoursAgo(162) },
      { authorId: stallman.id, body: 'The GPL is not a restriction. It\'s a guarantee that your freedom cannot be taken away by downstream users.', createdAt: hoursAgo(136) },
      { authorId: stallman.id, body: 'Proprietary software is an injustice. Users deserve to understand and modify the software they run.', createdAt: hoursAgo(108) },
      { authorId: stallman.id, body: 'Emacs is my life\'s work and also proof that a text editor can be Turing complete.', createdAt: hoursAgo(75) },
      { authorId: stallman.id, body: 'The right to read is non-negotiable. DRM is a war on users.', createdAt: hoursAgo(44) },
      { authorId: stallman.id, body: 'Copyleft turned copyright\'s logic against itself. That was intentional.', createdAt: hoursAgo(15) },

      // gosling — 6 posts
      { authorId: gosling.id, body: 'Write once, run anywhere. The JVM delivered on that promise better than anyone expected.', createdAt: hoursAgo(182) },
      { authorId: gosling.id, body: 'Null was a mistake. Tony said so too. We both kept making it.', createdAt: hoursAgo(157) },
      { authorId: gosling.id, body: 'Java\'s verbosity was a deliberate choice. Readable code matters more than writable code.', createdAt: hoursAgo(128) },
      { authorId: gosling.id, body: 'Garbage collection in 1995 was considered too slow. GC has now made manual memory management the niche.', createdAt: hoursAgo(95) },
      { authorId: gosling.id, body: 'The best Java feature was generics. The worst Java feature was also generics.', createdAt: hoursAgo(58) },
      { authorId: gosling.id, body: 'I still sail. The sea and code have something in common: both are full of subtle bugs that sink ships.', createdAt: hoursAgo(17) },

      // hoare — 5 posts
      { authorId: hoare.id, body: 'I call it my billion-dollar mistake. Null references. Every language copied it and every language suffers for it.', createdAt: hoursAgo(180) },
      { authorId: hoare.id, body: 'Quicksort is not the fastest algorithm. It is the most elegantly analyzable algorithm. That matters differently.', createdAt: hoursAgo(152) },
      { authorId: hoare.id, body: 'Communicating Sequential Processes — the ideas are more relevant now than when I wrote them.', createdAt: hoursAgo(118) },
      { authorId: hoare.id, body: 'There are two ways to write code: write code so simple there are obviously no bugs, or write code so complex there are no obvious bugs. The first is better.', createdAt: hoursAgo(78) },
      { authorId: hoare.id, body: 'The price of reliability is the pursuit of the utmost simplicity. It is a price which the very rich find most hard to pay.', createdAt: hoursAgo(29) },

      // kay — 8 posts
      { authorId: kay.id, body: 'The best way to predict the future is to invent it.', createdAt: hoursAgo(178) },
      { authorId: kay.id, body: 'Smalltalk was not about objects. It was about messaging. People got the objects and missed the messaging.', createdAt: hoursAgo(155) },
      { authorId: kay.id, body: 'Simple things should be simple. Complex things should be possible.', createdAt: hoursAgo(130) },
      { authorId: kay.id, body: 'A change in perspective is worth 80 IQ points.', createdAt: hoursAgo(108) },
      { authorId: kay.id, body: 'The internet was designed to be the new Gutenberg press. We turned it into the new television.', createdAt: hoursAgo(85) },
      { authorId: kay.id, body: 'Children are the R&D department of the human species.', createdAt: hoursAgo(60) },
      { authorId: kay.id, body: 'OOP was supposed to be about late binding and message passing. Most "OOP" languages got neither right.', createdAt: hoursAgo(36) },
      { authorId: kay.id, body: 'Technology is anything invented after you were born. Everything else is just furniture.', createdAt: hoursAgo(9) },

      // wirth — 6 posts
      { authorId: wirth.id, body: 'Software gets slower faster than hardware gets faster. Wirth\'s Law. I wish I were wrong.', createdAt: hoursAgo(175) },
      { authorId: wirth.id, body: 'Pascal was a teaching language. That people used it for production was flattering and occasionally alarming.', createdAt: hoursAgo(148) },
      { authorId: wirth.id, body: 'Good programming is not about using the latest tools. It\'s about using the right tool with discipline.', createdAt: hoursAgo(120) },
      { authorId: wirth.id, body: 'Modula-2 fixed what Pascal got wrong. Oberon fixed what Modula-2 got wrong. Each iteration was smaller and cleaner.', createdAt: hoursAgo(88) },
      { authorId: wirth.id, body: 'Algorithms plus data structures equals programs. Still true.', createdAt: hoursAgo(52) },
      { authorId: wirth.id, body: 'Complexity is the enemy. Reduction is the discipline.', createdAt: hoursAgo(13) },

      // floyd — 5 posts
      { authorId: floyd.id, body: 'Program verification is not about proving programs correct. It is about understanding them well enough that correctness becomes obvious.', createdAt: hoursAgo(172) },
      { authorId: floyd.id, body: 'The Floyd-Warshall algorithm runs in O(V³). For most graphs you\'ll encounter, that\'s fine.', createdAt: hoursAgo(142) },
      { authorId: floyd.id, body: 'Assertions are not just for debugging. They are documentation that the compiler can check.', createdAt: hoursAgo(108) },
      { authorId: floyd.id, body: 'The paradigms of programming: a methodology shift, not just a syntax shift.', createdAt: hoursAgo(70) },
      { authorId: floyd.id, body: 'Every non-trivial program contains at least one bug. Every trivial program is uninteresting.', createdAt: hoursAgo(24) },
    ],
  });

  // --- some cross-follows to make the social graph interesting ---

  await prisma.follow.createMany({
    data: [
      { followerId: linus.id, followingId: ken.id },
      { followerId: linus.id, followingId: dennis.id },
      { followerId: dennis.id, followingId: ken.id },
      { followerId: ken.id, followingId: dennis.id },
      { followerId: brian.id, followingId: ken.id },
      { followerId: brian.id, followingId: dennis.id },
      { followerId: guido.id, followingId: knuth.id },
      { followerId: guido.id, followingId: dijkstra.id },
      { followerId: bjarne.id, followingId: knuth.id },
      { followerId: bjarne.id, followingId: dennis.id },
      { followerId: gosling.id, followingId: hoare.id },
      { followerId: gosling.id, followingId: barbara.id },
      { followerId: carmack.id, followingId: linus.id },
      { followerId: carmack.id, followingId: knuth.id },
      { followerId: tim.id, followingId: vint.id },
      { followerId: vint.id, followingId: tim.id },
      { followerId: shannon.id, followingId: mccarthy.id },
      { followerId: mccarthy.id, followingId: dijkstra.id },
      { followerId: kay.id, followingId: mccarthy.id },
      { followerId: kay.id, followingId: barbara.id },
      { followerId: stallman.id, followingId: linus.id },
      { followerId: hoare.id, followingId: dijkstra.id },
      { followerId: floyd.id, followingId: knuth.id },
      { followerId: floyd.id, followingId: dijkstra.id },
      { followerId: wirth.id, followingId: knuth.id },
      { followerId: wirth.id, followingId: hoare.id },
      { followerId: ada.id, followingId: mccarthy.id },
      { followerId: alan.id, followingId: shannon.id },
      { followerId: margaret.id, followingId: barbara.id },
      { followerId: grace.id, followingId: knuth.id },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
