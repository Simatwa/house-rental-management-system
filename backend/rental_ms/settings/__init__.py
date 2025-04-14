from .config import env_setting

if env_setting.DEBUG == True:
    from .dev import *
else:
    from .prod import *
