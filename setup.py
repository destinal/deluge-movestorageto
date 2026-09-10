from setuptools import find_packages, setup

__plugin_name__ = "MoveStorageTo"
__author__ = "destinal"
__version__ = "0.2"
__description__ = "Move torrent storage to a media folder from the context menu."
__license__ = "GPLv3"

setup(
    name=__plugin_name__,
    version=__version__,
    description=__description__,
    author=__author__,
    license=__license__,
    packages=find_packages(),
    package_data={"movestorageto": ["data/*"]},
    entry_points="""
    [deluge.plugin.core]
    %s = %s:CorePlugin
    [deluge.plugin.web]
    %s = %s:WebUIPlugin
    """ % ((__plugin_name__, __plugin_name__.lower()) * 2),
)
