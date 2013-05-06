<%@ page import="

com.psddev.cms.db.Content,
com.psddev.cms.db.Draft,
com.psddev.cms.db.History,
com.psddev.cms.db.Schedule,
com.psddev.cms.db.Template,
com.psddev.cms.db.Trash,
com.psddev.cms.tool.ToolPageContext,

com.psddev.dari.db.Query,
com.psddev.dari.db.State,

java.util.Date,
java.util.List
" %><%

// --- Presentation ---

ToolPageContext wp = new ToolPageContext(pageContext);
Object object = request.getAttribute("object");

List<Throwable> errors = wp.getErrors();
if (errors != null && errors.size() > 0) {
    wp.include("/WEB-INF/errors.jsp");
    return;
}

Trash deleted = Query.findById(Trash.class, wp.uuidParam("deleted"));
if (deleted != null) {
    wp.write("<div class=\"message message-warning\"><p>");
    wp.write("Deleted ", deleted.getDeleteDate());
    wp.write(" by ", wp.objectLabel(deleted.getDeleteUser()));
    wp.write(".<p></div>");
    return;
}

Draft draft = wp.getOverlaidDraft(object);

if (draft != null) {
    Schedule schedule = draft.getSchedule();

    wp.writeStart("div", "class", "message message-warning");
        wp.writeHtml("This is a draft");

        if (schedule != null) {
            Date triggerDate = schedule.getTriggerDate();

            wp.writeHtml(" to be published ");
            wp.writeHtml(triggerDate != null ? triggerDate : "later");
        }

        wp.writeHtml(".");
    wp.writeEnd();

    return;
}

History history = wp.getOverlaidHistory(object);
if (history != null) {
    wp.write("<div class=\"message message-warning\"><p>");
    wp.write("This is a past revision of the <a href=\"");
    wp.write(wp.originalUrl(null, object));
    wp.write("\">original document</a> saved ");
    wp.write(history.getUpdateDate());
    wp.write(" by ");
    wp.write(wp.objectLabel(history.getUpdateUser()));
    wp.write(".</p><p><a class=\"icon icon-object-history\" href=\"");
    wp.write(wp.url("/content/historyName.jsp", "id", history.getId()));
    wp.write("\" target=\"editHistory\">Edit Revision Name</a></p></div>");
    return;
}

Date published = wp.dateParam("published");
if (published != null) {
    wp.write("<div class=\"message message-success\"><p>");
    wp.write("Published ", published);
    wp.write(".</p>");
    wp.write("</div>");
    return;
}

Date saved = wp.dateParam("saved");
if (saved != null) {
    wp.write("<div class=\"message message-success\"><p>");
    wp.write("Saved ", saved);
    wp.write(".</p></div>");
    return;
}
%>
