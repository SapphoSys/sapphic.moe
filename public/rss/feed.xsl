<?xml version="1.0" encoding="utf-8"?>
<!--
  Catppuccin RSS feed by Sapphic Angels.
  Licensed under the zlib license.
-->

<xsl:stylesheet
  version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
>
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en" dir="ltr">
      <head>
        <title>RSS | <xsl:value-of select="/rss/channel/title"/></title>
        <meta charset="UTF-8" />
        <meta http-equiv="x-ua-compatible" content="IE=edge,chrome=1" />
        <meta http-equiv="content-language" content="en_US" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  'ctp-base': '#1e1e2e',
                  'ctp-mantle': '#181825',
                  'ctp-text': '#cdd6f4',
                  'ctp-pink': '#f5c2e7',
                  'ctp-surface1': '#45475a',
                  'ctp-subtext1': '#bac2de',
                  'ctp-crust': '#11111b'
                },
                fontFamily: {
                  'atkinson': ['Atkinson Hyperlegible', 'Segoe UI', 'system-ui', 'sans-serif'],
                  'iosevka': ['Iosevka', 'monospace']
                }
              }
            }
          }
        </script>
        <link rel="stylesheet" href="/rss/font.css" />
        <link
          href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="width=device-width,minimum-scale=1,initial-scale=1,shrink-to-fit=no"
        />
        <meta name="referrer" content="none" />
      </head>

      <body class="flex min-h-screen flex-col bg-ctp-base text-ctp-text font-atkinson">
        <main class="mx-auto flex w-full max-w-4xl flex-grow flex-col px-8 py-8">
          <div class="w-full">
            <header class="pb-6">
              <a
                href="https://sapphic.moe"
                title="Click to return to the homepage."
                class="text-ctp-pink font-extrabold flex items-center gap-2.5 mt-2 mb-2 text-3xl ext-ctp-pink no-underline hover:opacity-50 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ctp-pink focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base rounded-full transition-all duration-200"
              >
                <img>
                  <xsl:attribute name="src">
                    <xsl:value-of select="/rss/channel/image/url" />
                  </xsl:attribute>
                  <xsl:attribute name="alt">
                    <xsl:value-of select="/rss/channel/image/title" />
                  </xsl:attribute>
                  <xsl:attribute name="class">h-8 w-8</xsl:attribute>
                </img>
                <xsl:value-of select="/rss/channel/title" />
              </a>

              <p class="mt-0.5 text-lg text-ctp-text">
                <xsl:value-of select="/rss/channel/description" />
              </p>
            </header>

              <div class="mb-6 rounded-lg border-2 border-ctp-pink bg-ctp-mantle px-5 py-5">
                <h2 class="mb-1 font-bold text-ctp-pink flex items-center gap-2 text-2xl">
                  <i class="mdi mdi-rss text-2xl" aria-hidden="true"></i>
                  This is an RSS feed.
                </h2>

                <ul class="m-0 list-none p-0">
                  <li class="mb-2">
                    To subscribe to this feed, add this URL to your RSS reader:
                    <code class="bg-ctp-surface1 px-2 py-1 rounded font-iosevka">https://sapphic.moe/rss.xml</code>
                  </li>

                  <li class="mb-2">
                    Learn more about RSS readers
                    <a
                      class="text-ctp-pink no-underline hover:opacity-50 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ctp-pink focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base rounded-full transition-all duration-200"
                      href="https://pluralistic.net/2024/10/16/keep-it-really-simple-stupid/"
                      target="_blank"
                      title="An article by Pluralistic about RSS readers."
                    >
                      here.</a
                    >
                  </li>
                </ul>
              </div>

              <xsl:for-each select="/rss/channel/item">
                <article class="flex flex-col mb-2 hover:border-ctp-pink">
                  <h2 class="flex items-center gap-2.5 mt-2 mb-2 text-3xl font-extrabold text-ctp-pink">
                    <a class="text-ctp-pink no-underline hover:opacity-50 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ctp-pink focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base rounded-full transition-all duration-200" hreflang="en" target="_blank">
                      <xsl:attribute name="href">
                        <xsl:value-of select="link" />
                      </xsl:attribute>

                      <xsl:value-of select="title" />
                    </a>
                  </h2>

                  <div class="flex flex-row gap-3 mb-2">
                    <time class="flex items-center gap-1.5 text-ctp-text text-xl">
                      <i class="mdi mdi-calendar text-ctp-pink text-2xl leading-none" aria-hidden="true"></i>
                      <xsl:value-of select="prettyDate" />
                    </time>

                    <div class="flex items-center gap-1.5 text-ctp-text text-xl">
                      <i class="mdi mdi-clock-outline text-ctp-pink text-2xl leading-none" aria-hidden="true"></i>
                      <xsl:value-of select="minutesRead" />
                    </div>
                  </div>

                  <div class="flex flex-wrap gap-3">
                    <xsl:for-each select="category">
                      <a class="flex flex-row items-center rounded-lg border border-ctp-pink bg-ctp-crust px-3 text-xl text-ctp-pink hover:bg-ctp-pink hover:text-ctp-crust hover:underline hover:opacity-50 motion-safe:transition motion-safe:duration-150 motion-safe:ease-in-out" href="https://sapphic.moe/articles/tag/{.}" target="_blank">
                        #<xsl:value-of select="." />
                      </a>
                    </xsl:for-each>
                  </div>

                  <p class="mt-2 text-lg font-medium text-ctp-subtext1 leading-normal">
                    <xsl:value-of select="description" />
                  </p>
                </article>
              </xsl:for-each>
          </div>
        </main>

        <footer class="bg-ctp-mantle mt-auto">
          <hr class="border-ctp-surface1 m-0 border-t" />
          <div class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-8 py-5 md:flex-row md:items-stretch md:justify-between">
            <div class="grid grid-rows-4 grid-cols-2 gap-2 md:shrink-0 md:gap-x-8 md:gap-y-1">
              <xsl:for-each select="/rss/channel/footerLinks/row">
                <div class="flex items-center gap-1 text-lg">
                  <i class="mdi mdi-{substring-after(left/icon, 'mdi:')} text-ctp-pink text-xl leading-none" aria-hidden="true"></i>
                  <a class="text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200">
                    <xsl:attribute name="href"><xsl:value-of select="left/url" /></xsl:attribute>
                    <xsl:if test="left/newWindow = 'true'"><xsl:attribute name="target">_blank</xsl:attribute></xsl:if>
                    <xsl:value-of select="left/text" />
                  </a>
                </div>
                <div class="flex items-center gap-1 text-lg">
                  <i class="mdi mdi-{substring-after(right/icon, 'mdi:')} text-ctp-pink text-xl leading-none" aria-hidden="true"></i>
                  <a class="text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200">
                    <xsl:attribute name="href"><xsl:value-of select="right/url" /></xsl:attribute>
                    <xsl:if test="right/newWindow = 'true'"><xsl:attribute name="target">_blank</xsl:attribute></xsl:if>
                    <xsl:value-of select="right/text" />
                  </a>
                </div>
              </xsl:for-each>
            </div>

            <div class="flex flex-col gap-2 text-left text-base md:shrink md:grow-0 md:gap-1 md:text-right">
              <div class="flex grow flex-col">
                <div class="flex flex-col">
                  <p>Copyright © 2016-2025 Sapphic Angels. 🏳️‍⚧️🏳️‍🌈</p>

                  <p>
                    Website licensed under <a class="text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200" href="https://opensource.org/licenses/zlib" target="_blank">zlib/libpng</a>.
                  </p>

                  <p>
                    Articles licensed under <a class="text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200" href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">CC BY-NC-SA 4.0</a>.
                  </p>
                </div>

                <div class="flex flex-col pt-5 text-ctp-subtext1">
                  <p class="break-words">
                    <a href="https://github.com/SapphoSys/sapphic.moe" class="font-bold text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200" target="_blank">
                      <xsl:value-of select="/rss/channel/versions/websiteName" />
                    </a>
                    <xsl:text> v</xsl:text>
                    <xsl:value-of select="/rss/channel/versions/website" />
                    <xsl:text> on Astro </xsl:text>
                    <xsl:value-of select="/rss/channel/versions/astro" />
                    <xsl:text> &amp; React </xsl:text>
                    <xsl:value-of select="/rss/channel/versions/react" />
                  </p>

                  <p class="break-words">
                    Updated on <xsl:value-of select="/rss/channel/versions/websiteDate" />
                    (<a href="{/rss/channel/versions/websiteHashURL}" class="text-ctp-pink hover:opacity-50 hover:underline transition-all duration-200" target="_blank">
                      <xsl:value-of select="/rss/channel/versions/websiteHash" />
                    </a>)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
