const { assert } = require("chai");
const { ethers } = require("hardhat");

describe("BabyToken", function () {
  let token, initialSupply;
  let owner, recipient;
  before(async () => {
    [owner, recipient] = await ethers.provider.listAccounts();
    initialSupply = ethers.utils.parseEther("10000");

    const BabyToken = await ethers.getContractFactory("BabyToken");
    token = await BabyToken.deploy(initialSupply, "Baby", "BBY");
    await token.deployed();
  });

  it("should mint our owner the supply", async function () {
    const balance = await token.balanceOf(owner);
    assert.equal(balance.toString(), initialSupply.toString());
  });

  describe("we transfer some tokens to someone else", () => {
    let transferAmount = ethers.utils.parseEther("900");
    before(async () => {
      await token.transfer(recipient, transferAmount);
    });

    it("should decrease the owners balance", async () => {
      const balance = await token.balanceOf(owner);
      assert.equal(balance.toString(), ethers.utils.parseEther("9100"));
    });

    it("should increase the recipients balance", async () => {
      const balance = await token.balanceOf(recipient);
      assert.equal(balance.toString(), ethers.utils.parseEther("900"));
    });

    describe("approve the recipient to spend our tokens", () => {
      const approvalAmount = ethers.utils.parseEther("2000");
      before(async () => {
        await token.approve(recipient, approvalAmount);
      });

      it("should update the allowances", async () => {
        const allowance = await token.allowance(owner, recipient);
        assert.equal(allowance.toString(), approvalAmount.toString());
      });

      describe("have the recipient spend the tokens", () => {
        before(async () => {
          const signer = await ethers.provider.getSigner(recipient);
          await token.connect(signer).transferFrom(owner, recipient, approvalAmount);
        });

        it("should increase the recipients balance", async () => {
          const balance = await token.balanceOf(recipient);
          assert.equal(balance.toString(), ethers.utils.parseEther("2900"));
        });
      });
    });
  });
});
