from urllib.parse import urlsplit


def frontend_urls(request):
    host = request.get_host()
    hostname = urlsplit(f"//{host}").hostname or host.split(":")[0]
    scheme = request.scheme
    frontend_base_url = f"{scheme}://{hostname}:3000"
    return {
        "FRONTEND_BASE_URL": frontend_base_url,
        "FRONTEND_MAIN_URL": f"{frontend_base_url}/main",
    }
