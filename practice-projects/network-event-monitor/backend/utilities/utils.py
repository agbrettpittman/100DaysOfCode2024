import sys, os, traceback
from fastapi import HTTPException


def printExceptionDetails():
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print("==== error =====================")
    print(exc_type, fname, exc_tb.tb_lineno)
    print(exc_obj)
    print("== traceback ==")
    print(traceback.format_exc())
    print("== end traceback ==")
    print("==== end error =================")


def convert_http_exception(e: HTTPException, backup_status:int = 500, backup_detail:str = "Internal Server Error"):
    if hasattr(e, "status_code"):
        status_code = e.status_code
    else:
        status_code = backup_status
    if hasattr(e, "detail"):
        detail = e.detail
    else:
        detail = backup_detail
    return HTTPException(status_code=status_code, detail=detail)
    


def handle_route_exception(e: Exception):
    should_print_details = False
    if hasattr(e, "status_code"):
        status_code = e.status_code
    elif isinstance(e, ValueError):
        status_code = 422
        print(e.__dict__)
    else:
        status_code = 500
        should_print_details = True

    print
    if hasattr(e, "detail"):
        detail = e.detail
    elif hasattr(e, "message"):
        detail = e.message
    else:
        try:
            detail = str(e)
        except:
            detail = "Internal Server Error"
            should_print_details = True
    if should_print_details:
        printExceptionDetails()

    raise HTTPException(status_code=status_code, detail=detail)