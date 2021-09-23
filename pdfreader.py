import fitz,os,sys,json


def genhtml(doc,xtype,i):
    if(i==0):
        f = open("./html/index.html", "w")
    else:
        f = open("./html/page_"+str(i)+".html", "w")
    f.write(doc[i].get_text(xtype))
    f.close()


def genimages(doc,i):
    for img in doc.getPageImageList(i):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        if pix.n < 5:       # this is GRAY or RGB
            pix.writePNG("./html/assets/img/p%s-%s.png" % (i, xref))
        else:               # CMYK: convert to RGB first
            pix1 = fitz.Pixmap(fitz.csRGB, pix)
            pix1.writePNG("./html/assets/img/p%s-%s.png" % (i, xref))
            pix1 = None
        pix = None

def startprocess(name):
    doc = fitz.open("./media/pdf/"+str(name))
    for i in range(len(doc)):
        genhtml(doc,'html',i)
        genimages(doc,i)


def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def removefiles(path):
    for i in os.listdir(path):
        if(os.path.isfile(path+i)):
            if os.path.exists(path+i):
                os.remove(path+i)
            else:
                print("The file does not exist")
        else:
            for j in os.listdir(path+i):
                for k in os.listdir(path+i+"/"+j):
                    if(os.path.isfile(path+i+"/"+j+"/"+k)):
                        if os.path.exists(path+i+"/"+j+"/"+k):
                            os.remove(path+i+"/"+j+"/"+k)
                        else:
                            print("The file does not exist")



def main():
    lines = read_in()
    removefiles(lines['path'])
    startprocess(lines['file'])


#start process
if __name__ == '__main__':
    main()