import {
  clearRight,
  goLeft,
  nextLine,
} from "https://denopkg.com/iamnathanj/cursor@v2.2.0/mod.ts";

export class LoadingService {
  private loading?: number;

  showLoading() {
    let i = 0;
    Deno.stdout.writeSync(new TextEncoder().encode("\x1b[36m> \x1b[0m"));
    Deno.stdout.writeSync(new TextEncoder().encode("now watching"));

    this.loading = setInterval(async () => {
      if (i % 4 === 3) {
        await goLeft(3);
        await clearRight();
      } else {
        Deno.stdout.writeSync(new TextEncoder().encode("."));
      }
      i++;
    }, 500);
  }

  async stopLoadinng() {
    if (this.loading) {
      clearInterval(this.loading);
      await nextLine();
    }
  }
}
