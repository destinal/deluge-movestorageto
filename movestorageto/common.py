import os.path

import pkg_resources


def get_resource(filename):
    return pkg_resources.resource_filename(
        "movestorageto", os.path.join("data", filename))
