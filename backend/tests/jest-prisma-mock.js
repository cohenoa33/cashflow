// Wire the prisma mock into the app's prisma wrapper (runs before each test)
jest.mock("../src/prisma/client", () => {
  const prismaMock = require("./__mocks__/prisma").default;
  return { prisma: prismaMock };
});
