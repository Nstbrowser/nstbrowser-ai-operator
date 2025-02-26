import json
import asyncio
from urllib.parse import urlencode
from langchain_openai import ChatOpenAI
from browser_use import Agent, Browser, BrowserConfig
from pydantic import SecretStr
import requests
from requests.exceptions import HTTPError

llm = ChatOpenAI(
    base_url="https://www.dmxapi.com/v1",
    model="gpt-4o",
    api_key=SecretStr("your-ai-api-key"),
)

async def run_browser_use():
    api_key = "your-nstbrowser-api-key"
    config = {
        "name": "browser-use-browser",
        "once": True,
        "platform": "windows",  # support: windows, mac, linux
        "kernel": "chromium",  # only support: chromium
        "kernelMilestone": "132",  # support: 113, 115, 118, 120, 124, 128, 130, 132
        "proxy": "",  # input format: schema://user:password@host:port eg: http://user:password@localhost:8080
    }

    query = urlencode({"x-api-key": api_key, "config": json.dumps(config)})  # required

    url = f"http://127.0.0.1:8848/devtool/launch?{query}"
    browser_ws_endpoint = get_debugger_url(url)

    config = BrowserConfig(cdp_url=browser_ws_endpoint)
    browser = Browser(config)

    agent = Agent(
        task="Go to Google, search for 'Nstbrowser Blog', click on the first post and return to the title",
        llm=llm,
        browser=browser,
    )
    result = await agent.run()
    print(result)
    await browser.close()

def get_debugger_url(url: str):
    try:
        resp = requests.get(url).json()
        if resp["data"] is None:
            raise Exception(resp["msg"])
        webSocketDebuggerUrl = resp["data"]["webSocketDebuggerUrl"]
        return webSocketDebuggerUrl

    except HTTPError:
        raise Exception(HTTPError.response)

asyncio.run(run_browser_use())