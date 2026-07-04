import { HttpClient } from "@angular/common/http";
import { importProvidersFrom } from "@angular/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";

function translateHttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, "/assets/i18n/", ".json");
}

export function provideI18n() {
  return importProvidersFrom(
    TranslateModule.forRoot({
      defaultLanguage: "fr",
      loader: {
        provide: TranslateLoader,
        useFactory: translateHttpLoaderFactory,
        deps: [HttpClient],
      },
    })
  );
}
